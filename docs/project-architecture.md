# Project Architecture

## Overview

AccentIQ is a full-stack AI pronunciation practice app.

The system is split into:

- React/Vite frontend in `client`
- Express/TypeScript backend in `server`
- Prisma ORM with PostgreSQL on Neon
- Gemini AI pronunciation guidance with a mock fallback
- Vercel frontend deployment
- Render backend deployment

## High-Level Flow

```txt
User
  -> React app
  -> Express API
  -> Pronunciation service
  -> Gemini AI or mock engine
  -> Prisma
  -> PostgreSQL
```

## Frontend

Main files:

- `client/src/App.tsx`
- `client/src/main.tsx`
- `client/src/services/api.ts`
- `client/src/index.css`
- `client/src/pages/Pronunciation.tsx`
- `client/src/pages/Progress.tsx`
- `client/src/pages/CaseStudy.tsx`
- `client/src/components/layout/Navbar.tsx`

Responsibilities:

- route rendering with React Router
- auth token storage in `localStorage` as `accentiq_token`
- login/register/Google OAuth completion UI
- pronunciation input and result display
- browser voice-to-text transcript filling
- history and favorites UI
- progress dashboard, streaks, and recommendations
- theme and local preference UI

The frontend reads the backend base URL from:

```env
VITE_API_BASE_URL
```

## Backend

Main files:

- `server/src/app.ts`
- `server/src/server.ts`
- `server/src/config/env.ts`
- `server/src/routes/auth.routes.ts`
- `server/src/routes/index.ts`
- `server/src/modules/pronunciation/pronunciation.routes.ts`
- `server/src/modules/pronunciation/pronunciation.service.ts`

Responsibilities:

- HTTP API routing
- auth registration and login
- Google OAuth redirect, callback, and handoff exchange
- JWT signing and verification
- optional auth for guest pronunciation analysis
- required auth for history and favorites
- request validation
- rate limiting, CORS, Helmet, compression, and error handling

## API Route Groups

Health:

```txt
GET /api/v1/health
```

Auth:

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/google
GET  /api/v1/auth/google/callback
POST /api/v1/auth/google/exchange
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

Pronunciation:

```txt
GET    /api/v1/pronunciation/options
POST   /api/v1/pronunciation/analyze
GET    /api/v1/pronunciation/history
GET    /api/v1/pronunciation/history/:id
DELETE /api/v1/pronunciation/history
DELETE /api/v1/pronunciation/history/:id
GET    /api/v1/pronunciation/favorites
POST   /api/v1/pronunciation/favorites
DELETE /api/v1/pronunciation/favorites/:id
```

## Database

Prisma schema:

```txt
server/prisma/schema.prisma
```

Core models:

- `User`
- `PronunciationHistory`
- `PronunciationFavorite`

Core enums:

- `AuthProvider`
- `Accent`
- `PronunciationInputType`

History and favorites are tied to users when the user is logged in. Guest pronunciation analysis works without saving account history.

## AI Engine

Pronunciation analysis goes through:

```txt
server/src/modules/pronunciation/pronunciation.service.ts
```

The service chooses the engine from:

```env
PRONUNCIATION_ENGINE=mock
PRONUNCIATION_ENGINE=ai
```

Provider routing lives in:

```txt
server/src/modules/pronunciation/ai/pronunciationAiRouter.ts
```

Gemini engine:

```txt
server/src/modules/pronunciation/engines/geminiPronunciation.engine.ts
```

Mock engine:

```txt
server/src/modules/pronunciation/engines/mockPronunciation.engine.ts
```

The AI layer is intentionally backend-owned so API keys stay server-side.

## Auth Architecture

Email auth:

- register with name, email, and password
- hash password with bcrypt
- issue JWT
- frontend stores JWT in `accentiq_token`

Google OAuth:

1. Frontend redirects to `/api/v1/auth/google`.
2. Backend redirects to Google.
3. Google redirects to `/api/v1/auth/google/callback`.
4. Backend creates or finds the user.
5. Backend redirects to frontend with a short-lived handoff token.
6. Frontend exchanges the handoff token for the normal AccentIQ JWT.

Google client secrets stay on the backend only.

## Progress And Recommendations

Progress dashboard data comes from existing saved history and favorites.

Current V3 analytics include:

- total saved practice
- unique words
- practice days
- current streak
- best streak
- weekly practice rhythm
- accent coverage
- favorite review queue
- recent practice
- personalized recommendations

Recommendations are activity-based. They do not claim to detect pronunciation mistakes or weak sounds from audio.

## Voice And Privacy Boundary

V3 does not upload raw audio, store raw audio, or score the user's real voice.

Browser voice-to-text fills the text box. AccentIQ analyzes the resulting text only after the user manually clicks Analyze.

Future raw audio scoring is blocked until privacy, consent, provider, retention, storage, and deletion rules are complete.

## Deployment Architecture

```txt
Vercel
  -> serves React app

Render
  -> runs Express API
  -> applies Prisma migrations during build
  -> connects to Neon PostgreSQL

Neon
  -> stores users, history, favorites, and OAuth account metadata
```

Production URLs:

- Frontend: `https://accent-iq.vercel.app`
- Backend: `https://accentiq-backend.onrender.com`
- Health: `https://accentiq-backend.onrender.com/api/v1/health`

## Key Safety Properties

- Secrets are read from environment variables.
- Frontend only receives public `VITE_*` values.
- Gemini keys stay on the backend.
- Google client secret stays on the backend.
- JWT secret stays on the backend.
- Raw audio upload and storage are not implemented in V3.
- Mock fallback keeps pronunciation analysis usable when AI is unavailable.
