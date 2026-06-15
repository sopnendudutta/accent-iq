# Deployment Guide

## Goal

Deploy AccentIQ safely to production using:

- Vercel for the frontend
- Render for the backend
- Neon PostgreSQL for the database

Production URLs:

- Frontend: `https://accent-iq.vercel.app`
- Backend: `https://accentiq-backend.onrender.com`
- Backend health: `https://accentiq-backend.onrender.com/api/v1/health`

## Pre-Deployment Checks

From a clean `dev` branch:

```powershell
git status
```

Backend:

```powershell
cd server
npm run build
npx prisma validate
cd ..
```

Frontend:

```powershell
cd client
npm run lint
npm run build
cd ..
```

Safety checks:

- no `.env` files staged
- no real secrets in docs
- no raw audio upload added
- no real voice-scoring claims added
- `dev` is pushed before opening a PR to `main`

## Backend Deployment On Render

Render service settings:

- Root directory: `server`
- Build command:

```txt
npm install && npm run prisma:migrate:deploy && npm run build
```

- Start command:

```txt
npm start
```

Expected start log:

```txt
AccentIQ API running on http://localhost:5000
```

The backend root `/` may return 404. That is expected. Use the health route:

```txt
https://accentiq-backend.onrender.com/api/v1/health
```

## Backend Environment Variables

Set these in Render:

```env
NODE_ENV=production
CORS_ORIGIN=https://accent-iq.vercel.app
TRUST_PROXY_HOPS=1
DATABASE_URL=<real Neon pooled database URL>
DIRECT_URL=<real Neon direct database URL>
JWT_SECRET=<real strong JWT secret>
JWT_EXPIRES_IN=7d
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<real Gemini API key>
GOOGLE_CLIENT_ID=<real Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<real Google OAuth client secret>
GOOGLE_CALLBACK_URL=https://accentiq-backend.onrender.com/api/v1/auth/google/callback
CLIENT_URL=https://accent-iq.vercel.app
```

Do not put real values in this repository.

## Database Deployment

Prisma schema:

```txt
server/prisma/schema.prisma
```

Render build applies production migrations with:

```txt
npm run prisma:migrate:deploy
```

Manual validation:

```powershell
cd server
npx prisma validate
```

Do not run destructive database commands against production.

## Frontend Deployment On Vercel

Vercel project settings:

- Root directory: `client`
- Build command:

```txt
npm run build
```

- Output directory:

```txt
dist
```

The frontend uses `client/vercel.json` to rewrite app routes to `index.html`, so routes like `/progress` and `/auth/google/callback` work on refresh.

## Frontend Environment Variables

Set this in Vercel:

```env
VITE_API_BASE_URL=https://accentiq-backend.onrender.com
```

Do not put Google client secrets, Gemini keys, JWT secrets, or database URLs in Vercel.

## Google OAuth Production Setup

Google Cloud authorized JavaScript origin:

```txt
https://accent-iq.vercel.app
```

Google Cloud authorized redirect URI:

```txt
https://accentiq-backend.onrender.com/api/v1/auth/google/callback
```

Full setup:

```txt
docs/google-oauth-production-setup.md
```

## AI Production Setup

Recommended production AI mode:

```env
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<real Gemini API key>
```

Fallback rule:

If Gemini is unavailable or misconfigured, the backend should not expose secrets and should keep a safe fallback path.

Full setup:

```txt
docs/production-ai-setup.md
```

## Production QA Checklist

After deployment:

- [ ] Frontend opens.
- [ ] Backend health returns success.
- [ ] Home page works.
- [ ] Pronunciation works as guest.
- [ ] Email register works.
- [ ] Email login works.
- [ ] Logout works.
- [ ] Google OAuth redirects to Google.
- [ ] Google OAuth callback returns to the app.
- [ ] `/api/v1/auth/me` works after login.
- [ ] Pronunciation saves history for logged-in users.
- [ ] Favorites can be added and removed.
- [ ] Progress dashboard loads.
- [ ] Streaks display from saved practice.
- [ ] Recommendations display from saved practice.
- [ ] About page works.
- [ ] Settings page works.
- [ ] Dark mode works.
- [ ] Mobile navigation works.
- [ ] No raw audio upload exists.
- [ ] No real voice-scoring claims appear.

## Common Issues

### Render Root Route Returns 404

Use:

```txt
/api/v1/health
```

The backend root route is not the health endpoint.

### CORS Error

Confirm Render has:

```env
CORS_ORIGIN=https://accent-iq.vercel.app
```

Then redeploy the backend.

### Rate Limit Proxy Warning

Confirm Render has:

```env
TRUST_PROXY_HOPS=1
```

Then redeploy the backend.

### Frontend Calls The Wrong Backend

Confirm Vercel has:

```env
VITE_API_BASE_URL=https://accentiq-backend.onrender.com
```

Then redeploy the frontend.

### Google Redirect Mismatch

Confirm these match exactly:

- Google Cloud authorized redirect URI
- Render `GOOGLE_CALLBACK_URL`
- backend callback route

Expected production value:

```txt
https://accentiq-backend.onrender.com/api/v1/auth/google/callback
```

## Merge And Release Flow

Recommended final flow:

1. Finish all V3 checkpoints on `dev`.
2. Run final QA.
3. Open PR from `dev` to `main`.
4. Merge only after manual approval.
5. Let production deployments run from `main`.
6. Verify live Vercel and Render deployments.
7. Sync `dev` with `main` after the merge.
