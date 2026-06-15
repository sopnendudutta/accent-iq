# AccentIQ V3 Release Summary

## Release Status

AccentIQ V3 is ready for final review on the `dev` branch.

This release summary was created for V3 Checkpoint 13 after running the required local build and validation checks.

QA run date: 2026-06-15

## What V3 Added

### Google OAuth

V3 added a backend-owned Google OAuth flow:

- backend start route
- backend callback route
- frontend OAuth callback route
- short-lived handoff token exchange
- normal AccentIQ JWT issuance after OAuth
- friendly fallback behavior when Google OAuth is not configured

Email login, email registration, logout, `/auth/me`, and guest practice remain part of the core auth flow.

### Daily Practice Streaks

V3 added streak tracking to the Progress dashboard using existing saved pronunciation history.

Streaks are based on logged-in saved practice days only. They do not measure pronunciation accuracy or voice quality.

Current dashboard signals include:

- current streak
- best streak
- practice day count
- weekly practice rhythm
- last practice date

### Personalized Recommendations

V3 added a "Recommended practice" section to Progress.

Recommendations are generated from existing saved data:

- recent practice
- favorites
- accent coverage
- streak status
- low practice count
- local practice goal preference

Recommendations are activity-based. They do not claim to detect weak sounds, score the user's voice, or diagnose pronunciation issues.

### Audio Privacy And Voice Scoring Planning

V3 added a planning document for audio privacy and future voice scoring:

```txt
docs/audio-privacy-and-voice-scoring-plan.md
```

The V3 decision is clear:

- no raw audio upload
- no raw audio storage
- no real voice pronunciation scoring
- browser voice-to-text remains transcript-based

Future audio scoring is blocked until consent, provider processing, storage, retention, and deletion rules are designed.

### README And GitHub Polish

V3 added portfolio documentation:

```txt
README.md
docs/project-architecture.md
docs/environment-variables.md
docs/deployment-guide.md
```

The docs cover setup, architecture, deployment, environment variables, privacy boundaries, and the V1/V2/V3 feature story.

## What Was Intentionally Skipped

V3 intentionally does not include:

- raw audio upload
- raw audio storage
- saved voice clips
- real voice pronunciation scoring
- speech disorder detection
- medical or therapeutic claims
- Meta/Facebook OAuth
- advanced weakness detection from audio
- AI recommendations that pretend to know pronunciation accuracy
- any feature that requires committing secrets

These were skipped to keep the project honest, safe, and production-ready.

## Safety Decisions

- Google client secrets stay on the backend only.
- Gemini API keys stay on the backend only.
- JWT secrets stay in environment variables only.
- `VITE_*` frontend variables contain only public values.
- Guest practice remains available.
- Browser voice-to-text only fills the text box.
- Users manually click Analyze after reviewing text.
- Progress and recommendations use saved text practice activity, not audio scoring.
- Mock pronunciation fallback remains available when AI is disabled or unavailable.
- `.env` files are not committed.

## Final QA Evidence

### Git State

- Branch checked: `dev`
- Working tree before Checkpoint 13 changes: clean
- Tracked `.env` files: only `.env.example` files

### Backend Checks

Passed:

```txt
prisma validate
prisma generate
tsc
```

Local backend smoke checks passed with mock mode and safe local test environment values:

```txt
GET  /api/v1/health                  200
GET  /api/v1/pronunciation/options   200
POST /api/v1/pronunciation/analyze   200
```

### Frontend Checks

Passed:

```txt
eslint .
tsc -b
vite build
```

Local Vite route smoke checks passed:

```txt
/                  200
/pronunciation     200
/progress          200
/about             200
/settings          200
/login             200
/register          200
/not-a-real-route  200
```

The unknown route returns the SPA shell as expected so React Router can render the NotFound page.

### Secret And Safety Scan

Checked for common secret patterns in source and docs.

Result:

- no real Google OAuth secret found
- no real Gemini API key found
- no real JWT secret found
- no real database URL found
- one false positive appeared in the old Vite SVG asset text, not in a credential file

Safety-copy scan confirmed V3 docs and UI continue to state:

- no raw audio upload
- no raw audio storage
- no real voice scoring
- no medical or speech diagnosis claims

## Manual QA Checklist

Local automated smoke coverage completed:

- [x] Home route serves
- [x] Pronunciation route serves
- [x] Progress route serves
- [x] About route serves
- [x] Settings route serves
- [x] Login route serves
- [x] Register route serves
- [x] Backend health works
- [x] Pronunciation options work
- [x] Guest mock pronunciation analysis works
- [x] Prisma schema validates
- [x] Backend TypeScript compiles
- [x] Frontend lint passes
- [x] Frontend TypeScript compiles
- [x] Frontend production build passes
- [x] No tracked real `.env` file
- [x] No raw audio upload added
- [x] No real voice-scoring claim added

Still recommended before merging to `main`:

- [ ] Open the live Vercel frontend.
- [ ] Open the live Render health endpoint.
- [ ] Test Pronunciation as a guest in the browser.
- [ ] Test Pronunciation while logged in.
- [ ] Test email register/login/logout against production.
- [ ] Test `/api/v1/auth/me` with a real token.
- [ ] Test saved history against production database.
- [ ] Test favorites against production database.
- [ ] Test Preferences UI.
- [ ] Test Progress dashboard with a logged-in user.
- [ ] Test streaks with real saved practice.
- [ ] Test recommendations with real saved history/favorites.
- [ ] Test Google OAuth with configured production credentials.
- [ ] Test Gemini AI mode with the production API key.
- [ ] Test mock fallback by disabling AI mode in a safe environment.
- [ ] Test dark mode visually.
- [ ] Test mobile layout and navbar visually.
- [ ] Confirm Vercel production deploy succeeds.
- [ ] Confirm Render production deploy succeeds.

## Known Limitations

- V3 does not include real voice scoring.
- V3 does not upload or store raw audio.
- Browser speech-to-text behavior depends on browser support.
- Streaks are calculated from saved history dates in the user's local browser timezone.
- Recommendations are simple and activity-based.
- Google OAuth requires correct Google Cloud, Render, and frontend environment setup.
- Production AI requires a valid Gemini key and Render environment configuration.
- The current local automated QA cannot fully replace visual mobile, dark mode, or production OAuth testing.

## Future Ideas

- Add real audio scoring only after explicit consent, retention, storage, provider, and deletion rules are complete.
- Add a dedicated backend analytics endpoint if history grows too large for frontend-only dashboard summaries.
- Add linked auth accounts so email and Google can share one user more flexibly.
- Add more guided practice paths.
- Add production screenshots to the README.
- Add end-to-end tests for auth, pronunciation, and progress flows.
- Add accessibility-focused QA for keyboard navigation and screen reader labels.

## Release Decision

Checkpoint 13 is complete when this summary is committed and pushed to `origin/dev`.

Checkpoint 14 should prepare the final merge checklist and PR instructions. It should not merge into `main` automatically.
