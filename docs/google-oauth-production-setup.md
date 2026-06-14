# Google OAuth Production Setup

## Goal

Prepare AccentIQ Google OAuth for production without committing secrets.

This document is for V3 Checkpoint 5. It covers the manual setup required in:

- Google Cloud Console
- Render backend environment variables
- Vercel frontend environment variables
- Production deployment and QA

No real OAuth client ID, client secret, JWT secret, database URL, Gemini key, or other secret should be written into this repository.

## Current AccentIQ URLs

Production frontend:

```txt
https://accent-iq.vercel.app
```

Production backend:

```txt
https://accentiq-backend.onrender.com
```

Backend Google OAuth start route:

```txt
https://accentiq-backend.onrender.com/api/v1/auth/google
```

Backend Google OAuth callback route:

```txt
https://accentiq-backend.onrender.com/api/v1/auth/google/callback
```

Frontend OAuth completion route:

```txt
https://accent-iq.vercel.app/auth/google/callback
```

Local frontend:

```txt
http://localhost:5173
```

Local backend:

```txt
http://localhost:5000
```

Local backend Google OAuth callback route:

```txt
http://localhost:5000/api/v1/auth/google/callback
```

## How AccentIQ OAuth Works

AccentIQ uses a backend-owned Google OAuth flow:

1. The user clicks "Continue with Google" on Login or Register.
2. The frontend redirects to:

```txt
/api/v1/auth/google
```

3. The backend redirects the browser to Google.
4. Google redirects back to the backend callback route:

```txt
/api/v1/auth/google/callback
```

5. The backend validates the Google profile, creates or finds an AccentIQ user, and redirects to the frontend callback route with a short-lived handoff token in the URL fragment.
6. The frontend callback page exchanges that handoff token at:

```txt
POST /api/v1/auth/google/exchange
```

7. The frontend stores the normal AccentIQ JWT in `localStorage` as:

```txt
accentiq_token
```

The long-lived AccentIQ JWT is not placed directly in the query string.

## Google Cloud Console Setup

### 1. Select Or Create A Google Cloud Project

Use the Google Cloud project that should own AccentIQ OAuth credentials.

### 2. Configure OAuth Consent

In Google Cloud Console, open the OAuth consent setup for the project.

Recommended AccentIQ values:

- App name: `AccentIQ`
- User support email: use the project owner's support email.
- Developer contact email: use the project owner's contact email.
- App domain: use the production frontend domain when available.

Scopes should stay minimal:

```txt
openid
email
profile
```

Do not request Drive, Gmail, Calendar, or other broad Google scopes for V3.

### 3. Create OAuth Client

Create an OAuth client with application type:

```txt
Web application
```

Suggested name:

```txt
AccentIQ Web
```

### 4. Add Authorized JavaScript Origins

Production:

```txt
https://accent-iq.vercel.app
```

Local development, if Google login should be testable locally:

```txt
http://localhost:5173
```

Do not add paths to JavaScript origins. Origins are scheme plus host plus optional port only.

### 5. Add Authorized Redirect URIs

Production:

```txt
https://accentiq-backend.onrender.com/api/v1/auth/google/callback
```

Local development, if Google login should be testable locally:

```txt
http://localhost:5000/api/v1/auth/google/callback
```

The production redirect URI must exactly match `GOOGLE_CALLBACK_URL` in Render.

### 6. Save The Client ID And Secret

Copy the Google OAuth client ID and client secret into Render environment variables only.

Do not paste the client secret into:

- GitHub
- Vercel frontend environment variables
- browser code
- documentation
- screenshots
- chat messages

## Render Backend Environment Variables

Set these on the Render backend service:

```env
GOOGLE_CLIENT_ID=<real Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<real Google OAuth client secret>
GOOGLE_CALLBACK_URL=https://accentiq-backend.onrender.com/api/v1/auth/google/callback
CLIENT_URL=https://accent-iq.vercel.app
```

Confirm the existing production backend values still exist:

```env
DATABASE_URL=<real Neon pooled database URL>
DIRECT_URL=<real Neon direct database URL>
JWT_SECRET=<real strong JWT secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://accent-iq.vercel.app
TRUST_PROXY_HOPS=1
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<real Gemini API key>
```

Notes:

- `GOOGLE_CLIENT_SECRET` belongs on Render only.
- `CLIENT_URL` is where the backend sends users after Google finishes.
- `GOOGLE_CALLBACK_URL` must match the Google Cloud redirect URI exactly.
- `CORS_ORIGIN` should match the production frontend.
- `TRUST_PROXY_HOPS=1` keeps Express proxy-aware behavior compatible with Render.

After changing Render env vars, redeploy the backend.

## Vercel Frontend Environment Variables

Set this on the Vercel frontend project:

```env
VITE_API_BASE_URL=https://accentiq-backend.onrender.com
```

Do not add the Google client secret to Vercel.

Important Vite rule:

- `VITE_*` values are bundled into browser code.
- `VITE_*` values must never contain secrets.
- `VITE_API_BASE_URL` is safe because it is only the public backend base URL.

After changing Vercel env vars, redeploy the frontend.

## Local Development Setup

Backend local `.env`:

```env
GOOGLE_CLIENT_ID=<real Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<real Google OAuth client secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

Frontend local `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Do not commit either local `.env` file.

## Deployment Order

1. Confirm this repository has no committed secrets.
2. Add the Google Cloud OAuth production and local URLs.
3. Add Render backend env vars.
4. Redeploy Render backend.
5. Confirm backend health:

```txt
https://accentiq-backend.onrender.com/api/v1/health
```

6. Add or confirm Vercel frontend env vars.
7. Redeploy Vercel frontend.
8. Open the production frontend:

```txt
https://accent-iq.vercel.app
```

9. Test email auth before Google OAuth.
10. Test Google OAuth.

## Production Test Checklist

- [ ] Live frontend opens.
- [ ] Live backend health endpoint returns success.
- [ ] Login page opens.
- [ ] Register page opens.
- [ ] Existing email login still works.
- [ ] Existing email registration still works.
- [ ] Guest pronunciation still works.
- [ ] Clicking "Continue with Google" redirects to Google.
- [ ] Google asks for only basic identity access.
- [ ] Google callback returns to AccentIQ.
- [ ] User lands in the app after OAuth.
- [ ] `accentiq_token` is stored after OAuth success.
- [ ] `/api/v1/auth/me` works with the OAuth-issued token.
- [ ] Pronunciation page works as the Google user.
- [ ] Progress page loads as the Google user.
- [ ] Logout works.
- [ ] Google OAuth failure returns a friendly message.
- [ ] Existing email auth still works after Google testing.

## Expected Error Behavior

If Google env vars are missing on Render, the user should be redirected back to Login with a friendly OAuth setup message.

If a Google account uses an email that already belongs to an existing AccentIQ email/password user, AccentIQ should show a conflict message and ask the user to use email login for now.

If Google returns no code, an invalid state, or an unverified email, AccentIQ should fail safely and not log the user in.

## Troubleshooting

### `redirect_uri_mismatch`

Check all three places:

- Google Cloud authorized redirect URI
- Render `GOOGLE_CALLBACK_URL`
- Backend route path

They must match exactly:

```txt
https://accentiq-backend.onrender.com/api/v1/auth/google/callback
```

### Google Button Returns Missing Config

Confirm Render has:

```env
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
CLIENT_URL
```

Then redeploy Render.

### Callback Returns To The Wrong Site

Check Render:

```env
CLIENT_URL=https://accent-iq.vercel.app
```

Then redeploy Render.

### Frontend Calls The Wrong Backend

Check Vercel:

```env
VITE_API_BASE_URL=https://accentiq-backend.onrender.com
```

Then redeploy Vercel.

### CORS Errors

Check Render:

```env
CORS_ORIGIN=https://accent-iq.vercel.app
```

Then redeploy Render.

### `/` On Render Returns 404

The backend root route is not the production health route. Use:

```txt
https://accentiq-backend.onrender.com/api/v1/health
```

## Safety Rules

- Do not commit `.env`.
- Do not commit Google OAuth secrets.
- Do not put `GOOGLE_CLIENT_SECRET` in Vercel.
- Do not put secrets in `VITE_*` variables.
- Do not store Google access tokens in the database in V3.
- Do not add raw audio upload in this checkpoint.
- Do not claim real voice scoring exists.
- Keep guest pronunciation practice working.
- Keep email login and registration working.

## Official References

- Google OAuth 2.0 for web server applications: `https://developers.google.com/identity/protocols/oauth2/web-server`
- Render environment variables: `https://render.com/docs/configure-environment-variables`
- Vercel environment variables: `https://vercel.com/docs/environment-variables`
- Vite environment variables: `https://vite.dev/guide/env-and-mode`
