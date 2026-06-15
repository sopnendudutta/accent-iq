# AccentIQ V3 Plan

## Overview

AccentIQ V3 is the final portfolio-ready phase of the project.

V1 established the core full-stack app: email auth, guest pronunciation practice, JWT auth, history, favorites, preferences, responsive UI, dark mode, and browser speech-to-text.

Earlier checkpoints upgraded the product with Gemini-powered pronunciation guidance, safe mock fallback, a simplified learner-focused result experience, expanded English accents, warmer full-screen UI, progress dashboard, and release documentation.

V3 should make AccentIQ feel complete, stable, honest, and production-grade without adding risky audio features before privacy and deletion rules are solved.

## Current Project Snapshot

The project is a full-stack React/Express/Prisma app.

Frontend:

- React, TypeScript, Vite
- React Router app shell in `client/src/App.tsx`
- Pages for Home, Pronunciation, Progress, About, Settings, Login, Register, and NotFound
- Global styling in `client/src/index.css`
- Auth token stored as `accentiq_token`

Backend:

- Express, TypeScript, Prisma, PostgreSQL
- JWT authentication
- Auth routes for register, login, current user, logout, and placeholder social auth
- Pronunciation routes for options, analysis, history, and favorites
- Gemini/mock pronunciation engine routing through `PRONUNCIATION_ENGINE`

Database:

- Prisma `User` model already includes `provider`, `providerAccountId`, and `imageUrl`
- `AuthProvider` enum already includes `GOOGLE`, `META`, and `EMAIL`
- Pronunciation history and favorites are saved per user
- Expanded accent enum is already present

Important observation:

The Progress page already calculates a current streak from saved pronunciation history. V3 streak work should review and complete the existing experience rather than duplicate the logic blindly.

## V3 Goals

- Add a safe Google OAuth login flow.
- Preserve existing email register/login and guest practice.
- Improve progress analytics honestly from saved practice data.
- Add daily streaks based on real saved history.
- Add personalized practice recommendations based on existing history and favorites.
- Document audio privacy and voice scoring decisions before implementing audio upload.
- Polish README and documentation for GitHub reviewers.
- Run final V3 QA before any merge to `main`.

## Features Included In V3

### Google OAuth

V3 should implement Google OAuth as the primary social login option.

The flow should:

- Start from a frontend "Continue with Google" action.
- Redirect through backend OAuth routes.
- Create or find a user by Google identity and email.
- Issue the same JWT style already used by email login.
- Redirect back to the frontend safely.
- Keep existing email login/register unchanged.
- Keep guest pronunciation practice unchanged.

### Daily Practice Streaks

Streaks should use saved pronunciation history.

Simple rule:

A practice day counts when a logged-in user has at least one saved pronunciation history item on that local calendar date.

Streaks should:

- Use real history only.
- Show guest-safe and empty states.
- Avoid fake streaks.
- Avoid implying audio accuracy scoring.

### Personalized Practice Recommendations

Recommendations should be simple and transparent.

Allowed signals:

- Recent practiced words
- Favorites
- Most practiced accent
- Low practice count
- Empty or inactive dashboard state

Examples:

- Practice saved favorites today.
- Try another accent for comparison.
- Start with a few beginner-friendly words if no history exists.

Recommendations must not claim to detect weak sounds, speech disorders, or pronunciation mistakes from raw audio.

### Better Dashboard Analytics

The Progress page should become a more useful summary of saved practice.

Potential additions:

- Current streak and best streak
- Weekly practice rhythm
- Favorite review queue
- Accent coverage
- Recent activity
- Recommendation section

Analytics must remain activity-based unless real scoring exists later.

### Audio Privacy And Voice Scoring Planning

V3 should create a serious planning document before any raw audio feature.

The plan must answer:

- Whether raw audio is uploaded
- Whether raw audio is stored
- Where it is stored
- How long it is retained
- Whether users can delete it
- Which provider processes audio
- What consent message appears
- What is not implemented yet

Default V3 decision:

Do not implement raw audio upload, raw audio storage, or real voice scoring in V3.

Browser speech-to-text remains the only voice input behavior.

### README And GitHub Polish

The repository should be easy for a reviewer to understand.

Documentation should cover:

- Project description
- Live demo
- Features
- Feature evolution summary
- Tech stack
- Architecture
- AI engine and fallback
- Safety and privacy notes
- Environment variables
- Local setup
- Deployment
- Future roadmap

## Features Skipped In V3

V3 should not include:

- Raw audio upload
- Raw audio storage
- Real voice pronunciation scoring
- Speech disorder diagnosis
- Medical claims
- Meta/Facebook OAuth before Google OAuth is complete and stable
- Overcomplicated AI agent flows
- Fake "AI knows your weak sounds" recommendations
- Any feature requiring committed secrets

## Risky Features Postponed

### Raw Audio Upload

Postpone until consent, storage, deletion, retention, provider processing, and security rules are complete.

### Real Voice Scoring

Postpone until AccentIQ can process actual audio safely and honestly.

Do not claim real voice scoring exists while the app only uses text input or browser speech-to-text transcripts.

### Meta/Facebook OAuth

Postpone until Google OAuth is implemented, deployed, and tested.

### Advanced AI Personalization

Postpone recommendations that claim to identify user weaknesses unless the product has real evidence from audio scoring or structured scoring data.

## Checkpoint List

1. Final V3 scope and safety planning.
2. Google OAuth architecture planning.
3. Google OAuth backend implementation.
4. Google OAuth frontend implementation.
5. Google OAuth production setup and testing docs.
6. Daily streaks planning.
7. Daily streaks implementation.
8. Personalized recommendations planning.
9. Personalized recommendations implementation.
10. Audio privacy and voice scoring planning.
11. README and GitHub polish.
12. Final V3 QA and release summary.
13. Final merge checklist and PR preparation.

## Safety Rules

- Work only on `dev`.
- Do not push directly to `main`.
- Do not merge into `main` automatically.
- Do not commit `.env`.
- Do not expose API keys, OAuth secrets, JWT secrets, database URLs, or provider credentials.
- Use placeholders in docs and `.env.example`.
- Preserve V1 email auth, guest practice, history, favorites, preferences, light/dark mode, and responsive UI.
- Preserve AI/mock fallback, expanded accents, simplified result UI, warm full-screen design, and progress dashboard.
- Do not add raw audio upload or storage in V3.
- Do not claim real voice scoring exists.
- Keep Google OAuth optional so missing OAuth env vars do not break normal email auth or guest practice.
- Keep production deployment notes manual when dashboard access is required.

## Testing Rules

Before each checkpoint:

```powershell
git status
git branch
```

Expected:

```txt
On branch dev
nothing to commit, working tree clean
```

After code changes:

- Run the relevant frontend and/or backend builds.
- Run Prisma validation when schema or backend database code changes.
- Confirm no `.env` or secret file is staged.
- Commit only the files changed for the checkpoint.
- Push each successful checkpoint to `origin/dev`.
- Stop after each checkpoint and report changed files, build results, commit hash, and manual test steps.

Manual QA should cover:

- Home
- Pronunciation as guest
- Pronunciation as logged-in user
- Email register/login/logout
- `/auth/me`
- History
- Favorites
- Preferences
- Progress dashboard
- Dark mode
- Mobile navigation
- AI mode and mock fallback when applicable
- Google OAuth once implemented

## Checkpoint 1 Decision

V3 is approved to proceed as a careful final polish phase.

The next checkpoint should be V3 Checkpoint 2: Google OAuth architecture planning.

Checkpoint 2 should be documentation-first and should inspect the real auth files before implementation. The current schema already has social auth fields, and the current backend has placeholder Google/Meta routes, so the plan should decide whether to build on those existing surfaces or replace them with a redirect-based OAuth flow.
