# CODEX_CONTEXT.md

# AccentIQ Project Context for Codex

## Project name

AccentIQ

## Project type

Full-stack AI pronunciation learning app.

AccentIQ helps users practice English pronunciation by typing a word/sentence or using browser voice-to-text. The app gives pronunciation guidance in a learner-friendly way.

## Current production status

AccentIQ V1 is fully completed and deployed.

* Frontend: Vercel
* Backend: Render
* Database: Neon PostgreSQL
* ORM: Prisma
* Main branch: production-safe
* Dev branch: ongoing V2 work

Production main must stay safe. All V2 work should happen on the `dev` branch first.

## Tech stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* CSS in `client/src/index.css`
* `client/src/App.css` is intentionally blank

### Backend

* Node.js
* Express
* TypeScript
* Prisma
* PostgreSQL / Neon
* JWT auth
* Zod validation
* Gemini AI integration for pronunciation analysis

### Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* Database hosted on Neon PostgreSQL

## V1 completed features

AccentIQ V1 includes:

* Guest pronunciation practice without login
* Email register/login
* JWT authentication
* `/auth/me` auth state test
* Logout
* Pronunciation analysis endpoint
* History save/fetch/delete/clear for logged-in users
* Favorites save/remove/fetch
* User preferences
* Light/dark mode
* Responsive UI
* Browser speech-to-text input
* Voice transcript fills the existing text box
* User manually clicks Analyze after transcript appears
* No raw audio upload
* No raw audio saving
* No real voice scoring yet
* Production-safe V1 deployment

## Important V1 voice decision

Voice input in V1 uses browser speech-to-text only.

It does not upload, store, or score raw audio.

Do not add real audio upload or voice scoring until privacy/security planning is completed later.

## V2 goal

AccentIQ V2 should improve the app carefully without breaking V1.

V2 major roadmap:

1. Real AI pronunciation engine in production
2. Google OAuth login
3. Meta/Facebook OAuth login
4. Real voice pronunciation scoring
5. Audio upload/recording with strict privacy controls
6. Progress dashboard
7. Daily practice streaks
8. More English accents
9. Personalized practice recommendations
10. Better AI feedback with examples and mistakes
11. Public portfolio-ready case study and analytics

## V2 completed checkpoints

### Checkpoint 1 — Branch safety + clean dev setup

Completed.

* Confirmed V2 work should continue on `dev`
* `main` stays production-safe
* Fixed accidental duplicate route folder issue
* Restored correct route structure
* Backend build passed
* Working tree was clean

Important route structure:

Correct:

```txt
server/src/routes/
server/src/controllers/
server/src/middleware/
server/src/validations/
server/src/modules/pronunciation/
```

Wrong duplicate folder that was removed:

```txt
server/src/modules/routes/
```

Do not recreate `server/src/modules/routes/`.

### Checkpoint 2 — V2 AI architecture planning

Completed.

Decision: first V2 feature should be real AI pronunciation for text input only.

No audio upload.
No voice scoring.
No database change.
No frontend breaking changes.

Safe flow:

```txt
Frontend text input
↓
POST /api/v1/pronunciation/analyze
↓
Backend tries AI engine if enabled
↓
If AI succeeds: return AI result
↓
If AI fails: fallback to mock engine
↓
Frontend shows stable result
```

### Checkpoint 3 — Existing AI/Gemini engine audit

Completed.

The project already has a V2-style AI architecture.

Important files:

```txt
server/src/config/env.ts
server/src/modules/pronunciation/pronunciation.service.ts
server/src/modules/pronunciation/ai/pronunciationAiRouter.ts
server/src/modules/pronunciation/engines/geminiPronunciation.engine.ts
server/src/modules/pronunciation/engines/mockPronunciation.engine.ts
server/src/modules/pronunciation/prompts/pronunciationPrompt.ts
server/src/modules/pronunciation/schemas/
server/src/modules/pronunciation/pronunciation.types.ts
```

The pronunciation service already switches between AI and mock:

```ts
env.PRONUNCIATION_ENGINE === "ai"
  ? await pronunciationAiRouter.analyze(engineInput)
  : mockPronunciationEngine.analyze(engineInput)
```

### Checkpoint 4 — Local AI enable test

Completed.

Gemini AI was enabled locally through `server/.env`.

Local env values used:

```env
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=real_local_key
```

AI worked locally.

No code changes were needed.

`.env` must not be committed.

### Checkpoint 5 — AI fallback safety testing

Completed.

Tested:

* Mock mode works
* AI mode with missing key falls back safely
* AI mode with wrong key falls back safely
* AI mode with real key works
* Backend does not crash

Fallback behavior is important and must be preserved.

### Checkpoint 6 — Simplified pronunciation result experience

Completed and pushed to GitHub `dev`.

Frontend result display was simplified to show only:

1. Phonetic spelling
2. Syllables
3. Mouth / tongue / lip guidance
4. Practice tips
5. Example sentence

The UI now hides distracting technical fields:

* IPA
* Stress pattern
* Common mistakes
* Slow practice
* Repeat count

Important: backend may still return these fields for compatibility, but the frontend should not emphasize them.

Files touched in Checkpoint 6:

```txt
server/src/modules/pronunciation/prompts/pronunciationPrompt.ts
client/src/pages/Pronunciation.tsx
```

### Checkpoint 6.5 — Design inspiration and AccentIQ design direction

Completed.

Added:

```txt
DESIGN.md
ACCENTIQ_DESIGN.md
```

`DESIGN.md` was generated using:

```powershell
npx getdesign@latest add claude
```

The Claude-style design inspiration is used as a broad reference only.

AccentIQ should not copy another brand directly.

## Current design problem

The current `client/src/index.css` is large and grew checkpoint-by-checkpoint. It works, but the UI feels too patched and card-heavy.

The user does not want AccentIQ to look like a dashboard made of many cards.

## Final design direction

AccentIQ V2 should become:

```txt
Full-screen warm AI pronunciation website
Not card-heavy
Not a generic dashboard
Not childish
Not dark/cinematic
Not a creative design tool
```

Visual direction:

```txt
Background: warm cream / soft parchment
Cards: soft white, rounded, spacious only where needed
Text: dark charcoal and readable
Accent color: warm terracotta/coral
Buttons: clean, confident, not flashy
Inputs: large, comfortable, premium
Result section: like a teacher explaining clearly
Mobile: spacious, not squeezed
```

Important design rule:

Home and Pronunciation should feel like full-screen website sections, not boxed card pages.

Cards are allowed mainly for:

```txt
About page
Settings page
Auth pages
History/Favorites review items if useful
```

Cards should not dominate:

```txt
Home page
Pronunciation page
Main result experience
```

## Design inspiration decision

Use this inspiration mix:

```txt
Claude = main mood: warm, calm, AI assistant-like
Linearity = layout inspiration only: full-screen spacing and confident website structure
ElevenLabs = future voice/listening inspiration only
Linear.app = future dashboard clarity only
```

Linearity should not be the main design system because it is for creative design/animation software, while AccentIQ is an AI pronunciation learning app.

## Current branch and safety rules

Always work on:

```txt
dev
```

Do not push directly to `main`.

Before changing files:

```powershell
git status
git branch
```

Expected:

```txt
On branch dev
nothing to commit, working tree clean
```

After successful checkpoints:

```powershell
git add <changed-files>
git commit -m "<message>"
git push origin dev
```

## Current immediate state

We paused at:

```txt
V2 Checkpoint 6.6 — Rebuild global index.css toward full-screen product design
```

The next file to work on is:

```txt
client/src/index.css
```

Do not touch backend.
Do not touch database.
Do not touch Prisma.
Do not add audio upload.
Do not add voice scoring yet.
