# Google OAuth Plan

## Goal

Add Google OAuth as the first social login option for AccentIQ V3 while preserving all existing V1/V2 behavior.

Google OAuth should be optional. Missing Google environment variables must not break:

- email registration
- email login
- `/auth/me`
- logout
- guest pronunciation practice
- saved history
- favorites
- progress dashboard

## Files Inspected

Backend:

- `server/prisma/schema.prisma`
- `server/src/routes/auth.routes.ts`
- `server/src/controllers/auth.controller.ts`
- `server/src/services/auth.service.ts`
- `server/src/middleware/auth.middleware.ts`
- `server/src/utils/jwt.ts`
- `server/src/config/env.ts`
- `server/.env.example`
- `server/package.json`

Frontend:

- `client/src/App.tsx`
- `client/src/pages/Login.tsx`
- `client/src/pages/Register.tsx`
- `client/src/services/api.ts`
- `client/src/types/auth.ts`

Note:

`client/src/utils/auth.ts` does not currently exist.

## Current Auth Behavior

AccentIQ currently supports email/password auth.

Current backend flow:

1. `POST /api/v1/auth/register`
2. `POST /api/v1/auth/login`
3. Backend creates or verifies an email user.
4. Backend signs a JWT with:

```ts
{
  userId: string;
  email: string;
  provider: "GOOGLE" | "META" | "EMAIL";
}
```

5. Frontend stores the token in `localStorage` as `accentiq_token`.
6. Frontend sends the token through `Authorization: Bearer <token>`.
7. `/api/v1/auth/me` returns the current user.

Current frontend behavior:

- `Login.tsx` and `Register.tsx` submit email/password forms.
- Successful auth stores `response.data.token` or `response.data.accessToken`.
- `App.tsx` reads `accentiq_token` and calls `getCurrentUser`.
- Logout removes `accentiq_token`.

Current placeholder social auth:

- `POST /api/v1/auth/google` returns `501`.
- `POST /api/v1/auth/meta` returns `501`.

Those placeholder routes should be replaced or supplemented by a real redirect-based Google OAuth flow.

## Database Impact

No Prisma migration should be needed for Google OAuth.

The `User` model already includes:

```prisma
imageUrl          String?
provider          AuthProvider @default(EMAIL)
providerAccountId String?

@@unique([provider, providerAccountId])
```

The `AuthProvider` enum already includes:

```prisma
GOOGLE
META
EMAIL
```

Recommended user matching:

1. First find by `{ provider: GOOGLE, providerAccountId: googleSub }`.
2. If not found, find by normalized email.
3. If the email already belongs to an `EMAIL` user, return a friendly conflict and ask the user to use email login for now.
4. If no user exists, create a Google user with:
   - `email`
   - `name`
   - `imageUrl`
   - `provider: GOOGLE`
   - `providerAccountId: googleSub`
   - `passwordHash: null`

Important risk:

Changing an existing email user to `provider: GOOGLE` means password login will no longer work because `login()` currently rejects non-`EMAIL` users. If keeping both email and Google login for the same email is required later, the schema should eventually support linked auth accounts separately.

This avoids accidentally breaking existing password login.

## Required Environment Variables

Backend:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLIENT_URL=
```

Existing required backend env remains:

```env
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGIN=
```

Frontend:

```env
VITE_API_BASE_URL=
```

Do not commit real Google client IDs, secrets, JWT secrets, database URLs, or API keys.

## Dependency Plan

Current backend dependencies do not include a Google OAuth helper.

Recommended implementation option:

- Add `google-auth-library` on the backend.

Why:

- It is an official Google library.
- It can generate OAuth URLs and exchange/verify Google identity data.
- It avoids hand-rolled token verification.

Alternative:

- Use direct `fetch` calls to Google OAuth/token/userinfo endpoints.

Preferred V3 decision:

Use `google-auth-library` if implementation stays straightforward. Do not add Passport unless the app is moved to a broader session-based auth strategy.

## Backend Route Design

Replace the placeholder Google auth route with redirect-based endpoints.

Recommended routes:

```txt
GET /api/v1/auth/google
GET /api/v1/auth/google/callback
POST /api/v1/auth/google/exchange
```

### `GET /api/v1/auth/google`

Purpose:

- Start Google OAuth.
- Build a Google authorization URL.
- Redirect the browser to Google.

Behavior:

- If Google env vars are missing, redirect to:

```txt
{CLIENT_URL}/login?oauth=google_missing_config
```

- Generate Google auth URL with:
  - `client_id`
  - `redirect_uri`
  - `response_type=code`
  - `scope=openid email profile`
  - `access_type=offline` only if refresh tokens are intentionally needed
  - `prompt=select_account`

Do not request broad scopes.

### `GET /api/v1/auth/google/callback`

Purpose:

- Receive Google `code`.
- Exchange code for Google identity.
- Find or create an AccentIQ user.
- Produce a normal AccentIQ JWT.
- Redirect back to the frontend.

Behavior:

1. Validate Google env vars.
2. Require `code`.
3. Exchange `code` using Google OAuth client.
4. Verify Google profile fields:
   - `sub`
   - `email`
   - `email_verified`
   - `name`
   - `picture`
5. Reject if email is missing or not verified.
6. Find or create user safely.
7. Generate AccentIQ JWT using existing `generateToken`.
8. Redirect to frontend success page.

Recommended redirect target:

```txt
{CLIENT_URL}/auth/google/callback#token=<short-lived-handoff-token>
```

Avoid placing the long-lived app JWT directly in a query string.

### `POST /api/v1/auth/google/exchange`

Purpose:

- Exchange a short-lived OAuth handoff token for the normal AccentIQ auth response.

Why:

- Keeps the final app JWT out of query string logs.
- Lets the frontend finish the existing auth flow by storing `accentiq_token`.
- Avoids adding server sessions or cookies in V3.

Response should match existing auth responses:

```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": {},
    "token": "accentiq_jwt"
  }
}
```

If the implementation chooses to skip the exchange endpoint for simplicity, use URL fragment only, immediately remove it from browser history, and document the tradeoff.

## Service Design

Add service functions in `auth.service.ts` or a small auth OAuth helper module:

- `getGoogleAuthUrl()`
- `handleGoogleCallback(code: string)`
- `exchangeGoogleHandoffToken(token: string)`
- `findOrCreateGoogleUser(profile)`

Keep `register`, `login`, and `getMe` unchanged unless strictly necessary.

OAuth user response should reuse `removeSensitiveUserFields`.

JWT issuance should reuse `generateToken`.

## Env Validation Design

Add optional Google env vars to `server/src/config/env.ts`:

```ts
GOOGLE_CLIENT_ID: z.string().optional(),
GOOGLE_CLIENT_SECRET: z.string().optional(),
GOOGLE_CALLBACK_URL: z.string().url().optional(),
CLIENT_URL: z.string().url().default("http://localhost:5173"),
```

Important:

- Do not make Google env vars required at server startup.
- Normal email auth and guest practice must still work without Google config.
- OAuth routes should fail gracefully when config is missing.

## Frontend Flow

Add a "Continue with Google" button to:

- `client/src/pages/Login.tsx`
- `client/src/pages/Register.tsx` if the UI remains clean

Button behavior:

```ts
window.location.href = `${API_BASE_URL}/api/v1/auth/google`;
```

Add a frontend callback route:

```txt
/auth/google/callback
```

Possible file:

```txt
client/src/pages/OAuthCallback.tsx
```

Callback behavior:

1. Read `token` or `error` from the URL fragment/query.
2. If a handoff token exists, call `POST /api/v1/auth/google/exchange`.
3. Store returned `data.token` in `localStorage` as `accentiq_token`.
4. Call existing `onAuthSuccess(user)` or trigger current-user reload.
5. Navigate to `/pronunciation` or `/progress`.
6. If an error exists, navigate to `/login?oauth=failed` or show a friendly error.
7. Remove token/handoff data from browser history with `replace`.

Possible shared helper:

- Add `startGoogleOAuth()` and `exchangeGoogleOAuthToken()` in `client/src/services/api.ts`.

Do not create a separate `client/src/utils/auth.ts` unless it removes real duplication.

## User Experience

Login and Register should keep the warm AccentIQ auth-card design.

Google button copy:

```txt
Continue with Google
```

Error copy examples:

- "Google login is not configured yet."
- "Google login could not be completed. Please try again or use email login."
- "This email already uses password login. Please login with email for now."

Do not block email forms when Google is unavailable.

## Security Notes

- Use only `openid email profile` scopes.
- Require verified Google email.
- Never commit Google client secret.
- Do not store Google access tokens unless a future feature needs them.
- Do not request offline access unless refresh tokens are needed.
- Do not expose raw Google profile data beyond safe user fields.
- Avoid long-lived app JWTs in query strings.
- If using URL fragments, clear them immediately after processing.
- Rate limiting already exists globally and should continue to protect auth routes.

## Guest Behavior

Guest pronunciation practice must remain unchanged.

OAuth work should not alter:

- `optionalAuth` on pronunciation analysis
- guest access to `/pronunciation`
- guest-safe progress/login prompts

## Testing Checklist

Backend local tests:

- Server starts without Google env vars.
- Email register still works.
- Email login still works.
- `/api/v1/auth/me` still works with an email JWT.
- Logout response still works.
- `GET /api/v1/auth/google` exists.
- Missing Google config redirects or responds with a friendly failure.
- Google callback rejects missing `code`.
- Google callback rejects unverified email.
- Google callback creates a Google user when valid.
- Google callback does not overwrite an existing email user unexpectedly.
- JWT generated after Google auth works with `/auth/me`.

Frontend local tests:

- Login page loads.
- Register page loads.
- Email login still works.
- Email register still works.
- "Continue with Google" appears.
- Google button redirects to backend start route.
- OAuth failure returns a friendly message.
- OAuth success stores `accentiq_token`.
- OAuth success loads current user.
- Mobile auth layout works.
- Dark mode auth layout works.

Regression tests:

- Guest pronunciation still works.
- Logged-in pronunciation still saves history.
- Favorites still save/remove.
- Progress dashboard still loads.
- Settings displays provider safely.

## Production Setup Notes

Google Cloud Console:

- Create OAuth client for a web application.
- Add authorized JavaScript origins:
  - `https://accent-iq.vercel.app`
  - `http://localhost:5173` for local testing if needed
- Add authorized redirect URIs:
  - `https://accentiq-backend.onrender.com/api/v1/auth/google/callback`
  - `http://localhost:5000/api/v1/auth/google/callback` for local testing if needed

Render backend env:

```env
GOOGLE_CLIENT_ID=<real client id>
GOOGLE_CLIENT_SECRET=<real client secret>
GOOGLE_CALLBACK_URL=https://accentiq-backend.onrender.com/api/v1/auth/google/callback
CLIENT_URL=https://accent-iq.vercel.app
```

Vercel frontend env:

```env
VITE_API_BASE_URL=https://accentiq-backend.onrender.com
```

After deployment:

- Confirm Render uses the new env vars.
- Confirm Vercel has the backend URL.
- Confirm Google redirect URI exactly matches Render callback route.
- Test email auth before Google auth.
- Test Google auth after both deployments finish.

## Checkpoint 2 Decision

Google OAuth should proceed in V3 Checkpoint 3 as a backend-first implementation.

Recommended backend implementation:

1. Add optional Google env vars.
2. Add `google-auth-library`.
3. Replace placeholder Google route with redirect start/callback routes.
4. Add a safe handoff/exchange flow or document any simpler redirect tradeoff.
5. Create Google users without breaking existing email users.
6. Keep Meta route as placeholder or remove it from active UI until planned later.
7. Update `.env.example` with placeholders only.

No Prisma migration is expected for Checkpoint 3 unless implementation discovers a schema constraint issue.
