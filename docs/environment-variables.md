# Environment Variables

## Goal

List the environment variables used by AccentIQ without exposing real secrets.

Do not commit `.env` files or real values for API keys, OAuth secrets, JWT secrets, or database URLs.

## Server Variables

These belong in `server/.env` for local development and in Render for production.

### Runtime

```env
PORT=5000
NODE_ENV=development
```

Production:

```env
NODE_ENV=production
```

### CORS And Proxy

Local:

```env
CORS_ORIGIN=http://localhost:5173
TRUST_PROXY_HOPS=1
```

Production:

```env
CORS_ORIGIN=https://accent-iq.vercel.app
TRUST_PROXY_HOPS=1
```

`TRUST_PROXY_HOPS=1` is expected on Render so rate limiting can identify requests correctly behind Render's proxy.

### Database

```env
DATABASE_URL=<PostgreSQL pooled database URL>
DIRECT_URL=<PostgreSQL direct database URL>
```

Notes:

- `DATABASE_URL` is used by Prisma Client.
- `DIRECT_URL` is used by Prisma migrations.
- Both are secrets.

### JWT

```env
JWT_SECRET=<strong secret>
JWT_EXPIRES_IN=7d
```

`JWT_SECRET` must be a strong private value in production.

### Pronunciation Engine

Mock mode:

```env
PRONUNCIATION_ENGINE=mock
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
```

AI mode:

```env
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<real Gemini API key>
```

Optional Groq placeholders exist in the backend:

```env
GROQ_API_KEY=<optional Groq API key>
GROQ_MODEL=llama-3.1-8b-instant
```

Current production recommendation:

```env
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<real Gemini API key>
```

### Google OAuth

Local:

```env
GOOGLE_CLIENT_ID=<real Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<real Google OAuth client secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
CLIENT_URL=http://localhost:5173
```

Production:

```env
GOOGLE_CLIENT_ID=<real Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<real Google OAuth client secret>
GOOGLE_CALLBACK_URL=https://accentiq-backend.onrender.com/api/v1/auth/google/callback
CLIENT_URL=https://accent-iq.vercel.app
```

The Google client secret must never be placed in Vercel or browser code.

## Client Variables

These belong in `client/.env` for local development and in Vercel for production.

Local:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Production:

```env
VITE_API_BASE_URL=https://accentiq-backend.onrender.com
```

Vite exposes `VITE_*` values to the browser bundle. Do not put secrets in client environment variables.

## Minimal Local Development Setup

Server:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
TRUST_PROXY_HOPS=1
DATABASE_URL=<local or Neon pooled database URL>
DIRECT_URL=<local or Neon direct database URL>
JWT_SECRET=<local development secret>
JWT_EXPIRES_IN=7d
PRONUNCIATION_ENGINE=mock
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```

Client:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Google OAuth and Gemini are optional locally unless you are testing those flows.

## Production Checklist

Render backend:

- [ ] `NODE_ENV=production`
- [ ] `PORT` is provided by Render or compatible with the service setup.
- [ ] `CORS_ORIGIN=https://accent-iq.vercel.app`
- [ ] `TRUST_PROXY_HOPS=1`
- [ ] `DATABASE_URL` is set.
- [ ] `DIRECT_URL` is set.
- [ ] `JWT_SECRET` is strong and private.
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `PRONUNCIATION_ENGINE=ai`
- [ ] `AI_PROVIDER=gemini`
- [ ] `GEMINI_MODEL=gemini-2.5-flash`
- [ ] `GEMINI_API_KEY` is set.
- [ ] `GOOGLE_CLIENT_ID` is set.
- [ ] `GOOGLE_CLIENT_SECRET` is set.
- [ ] `GOOGLE_CALLBACK_URL=https://accentiq-backend.onrender.com/api/v1/auth/google/callback`
- [ ] `CLIENT_URL=https://accent-iq.vercel.app`

Vercel frontend:

- [ ] `VITE_API_BASE_URL=https://accentiq-backend.onrender.com`

## Secret Safety

Never commit:

- `.env`
- real database URLs
- JWT secrets
- Google client secrets
- Gemini API keys
- OAuth callback screenshots containing secrets
- Render or Vercel dashboard screenshots showing secrets

Only placeholders belong in documentation.
