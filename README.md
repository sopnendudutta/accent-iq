# AccentIQ

AccentIQ is a full-stack AI pronunciation learning app. Learners can type a word or sentence, or use browser voice-to-text to fill the text box, then get clear pronunciation guidance across multiple English accents.

Live demo:

- Frontend: `https://accent-iq.vercel.app`
- Backend health: `https://accentiq-backend.onrender.com/api/v1/health`

## Screenshots

Screenshots can be added here after the final production QA pass.

Suggested captures:

- Home page
- Pronunciation workspace
- Progress dashboard
- Mobile navigation

## Features

- Guest pronunciation practice without login
- Email register/login/logout with JWT auth
- Google OAuth login flow
- Browser voice-to-text transcript input
- AI pronunciation guidance with mock fallback
- Multiple English accent options
- Saved pronunciation history for logged-in users
- Favorites and review queue
- User preferences, including default accent and practice goal
- Daily practice streaks from saved history
- Personalized recommendations from saved activity
- Progress dashboard with weekly rhythm and accent coverage
- Light and dark mode
- Responsive full-screen UI

## Version Summary

### V1

V1 established the core product foundation:

- guest practice
- email auth
- JWT auth state
- history and favorites
- preferences
- responsive UI
- browser voice-to-text
- no raw audio upload or storage

### V2

V2 made the product feel more complete:

- Gemini pronunciation guidance
- safe mock fallback
- expanded English accents
- simplified teacher-like result UI
- warm full-screen redesign
- progress dashboard
- production AI setup documentation

### V3

V3 is the final portfolio polish phase:

- Google OAuth
- daily practice streaks
- personalized practice recommendations
- audio privacy and voice-scoring planning
- README and documentation polish
- final QA and merge preparation

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- React Router
- CSS in `client/src/index.css`
- Vercel deployment

Backend:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL on Neon
- JWT authentication
- Google OAuth
- Zod validation
- Render deployment

AI:

- Gemini pronunciation guidance through the backend
- Mock pronunciation engine fallback
- Provider controlled by environment variables

## Architecture Overview

```txt
React/Vite frontend
  -> Express API
  -> Pronunciation service
  -> Gemini AI or mock fallback
  -> Prisma
  -> Neon PostgreSQL
```

Main API areas:

- `/api/v1/health`
- `/api/v1/auth/register`
- `/api/v1/auth/login`
- `/api/v1/auth/google`
- `/api/v1/auth/google/callback`
- `/api/v1/auth/google/exchange`
- `/api/v1/auth/me`
- `/api/v1/auth/logout`
- `/api/v1/pronunciation/options`
- `/api/v1/pronunciation/analyze`
- `/api/v1/pronunciation/history`
- `/api/v1/pronunciation/favorites`

More detail:

- `docs/project-architecture.md`
- `server/docs/auth-api.md`
- `server/docs/pronunciation-api.md`

## AI Engine And Fallback

AccentIQ routes pronunciation analysis through the backend. The frontend does not call Gemini directly.

The backend uses:

- `PRONUNCIATION_ENGINE=mock` for deterministic local or fallback behavior
- `PRONUNCIATION_ENGINE=ai` with `AI_PROVIDER=gemini` for Gemini guidance

If Gemini is disabled, missing a key, or fails, the app can fall back to mock guidance so the user experience does not collapse.

## Safety And Privacy

Important current boundary:

- AccentIQ V3 does not upload raw audio.
- AccentIQ V3 does not store raw audio.
- AccentIQ V3 does not provide real voice pronunciation scoring.
- Browser voice-to-text only fills the text box.
- Users manually click Analyze after reviewing the text.

Recommendations and dashboard analytics are based on saved text practice activity, favorites, streaks, and accent coverage. They do not claim to detect weak sounds or diagnose speech issues.

More detail:

- `docs/audio-privacy-and-voice-scoring-plan.md`
- `docs/recommendations-plan.md`
- `docs/streaks-plan.md`

## Environment Variables

See `docs/environment-variables.md` for the full list.

Common local values:

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
GEMINI_API_KEY=<optional for AI mode>
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
CLIENT_URL=http://localhost:5173
```

Client:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Do not commit `.env` files or real secrets.

## Local Setup

Install backend dependencies:

```powershell
cd server
npm install
```

Install frontend dependencies:

```powershell
cd client
npm install
```

Validate and generate Prisma client:

```powershell
cd server
npx prisma validate
npx prisma generate
```

Run backend:

```powershell
cd server
npm run dev
```

Run frontend:

```powershell
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/api/v1/health`

## Build Checks

Backend:

```powershell
cd server
npm run build
```

Frontend:

```powershell
cd client
npm run lint
npm run build
```

Prisma:

```powershell
cd server
npx prisma validate
```

## Deployment Notes

Production deployment uses:

- Vercel for `client`
- Render for `server`
- Neon PostgreSQL for the database

Detailed deployment steps:

- `docs/deployment-guide.md`
- `docs/google-oauth-production-setup.md`
- `docs/production-ai-setup.md`

## Future Roadmap

- Final production QA
- Final merge checklist and PR from `dev` to `main`
- Raw audio scoring only after privacy, consent, retention, storage, and deletion are fully designed
- More structured lessons and practice plans
- More advanced analytics after trustworthy scoring data exists

## Repository Safety Rules

- Work on `dev` before merging to `main`.
- Do not commit `.env`.
- Do not expose API keys, OAuth secrets, JWT secrets, or database URLs.
- Do not claim real voice scoring exists until raw audio scoring is actually implemented.
- Keep guest mode, email auth, Google OAuth, history, favorites, and progress dashboard stable.
