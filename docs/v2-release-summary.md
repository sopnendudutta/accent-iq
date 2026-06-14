# AccentIQ V2 Release Summary

## Overview

AccentIQ V2 improves the app from a working pronunciation practice tool into a more polished AI-powered pronunciation learning product.

V2 focuses on real AI pronunciation guidance, a cleaner learning experience, more accent support, better UI/UX, and a progress dashboard.

## Completed V2 Features

### 1. Real AI pronunciation engine

AccentIQ now supports a Gemini-powered pronunciation engine for text input.

The backend can switch between:

- mock pronunciation engine
- AI pronunciation engine

using environment variables.

### 2. Safe AI fallback

If Gemini fails, if the API key is missing, or if the AI response is invalid, AccentIQ falls back to the mock pronunciation engine.

This protects production stability.

### 3. Simplified pronunciation result

The result experience was simplified to show only the most useful learner-focused sections:

- phonetic spelling
- syllables
- mouth / tongue / lip guidance
- practice tips
- example sentence

Technical distractions like IPA, stress pattern, common mistakes, slow practice, and repeat count are hidden from the main UI.

### 4. Production AI setup

The backend supports production AI setup through Render environment variables:

- PRONUNCIATION_ENGINE
- AI_PROVIDER
- GEMINI_MODEL
- GEMINI_API_KEY

### 5. Full-screen product design

The UI was redesigned toward a warmer full-screen product website style.

Design direction:

- warm cream / parchment background
- dark charcoal readable text
- terracotta/coral accent
- large comfortable inputs
- clean confident buttons
- teacher-like result section
- spacious mobile layout

Home and Pronunciation are no longer intended to feel like boxed dashboard pages.

### 6. More English accents

AccentIQ V2 adds more English accent options for pronunciation practice.

Supported accents include the original accents plus expanded English variants such as Canadian, Irish, New Zealand, South African, and Singapore English.

### 7. Progress dashboard

AccentIQ V2 includes a progress dashboard using user practice data.

The dashboard helps users understand:

- total practice attempts
- saved favorites
- recent practice
- most used accent
- practice activity

Guest users see a login-focused state.

## Safety Decisions

V2 intentionally does not include:

- raw audio upload
- raw audio storage
- real voice scoring
- medical/speech disorder diagnosis
- unsafe AI claims
- exposed API keys

Voice input remains browser speech-to-text only unless future privacy planning is completed.

## Deployment Notes

Frontend:

- Vercel

Backend:

- Render

Database:

- Neon PostgreSQL with Prisma

If Prisma migrations were added, production must run:

```txt
npx prisma migrate deploy
```

## QA Checklist

Before merging V2 into main:

- frontend build passes
- backend build passes
- Prisma schema validates
- AI works locally
- AI fallback works locally
- production backend works
- production frontend works
- guest pronunciation works
- logged-in pronunciation works
- history works
- favorites work
- preferences work
- dashboard works
- more accents work
- mobile layout works
- dark mode works
- no `.env` committed
- no secrets committed

## Known Limitations

- Real voice scoring is not included yet.
- Raw audio upload is not included yet.
- OAuth may be handled in a later phase if not already implemented.
- Personalized recommendations and streaks may be future V2.5/V3 work.

## Final Decision

AccentIQ V2 is ready for merge only after manual review confirms that all V1 features still work and all V2 features are stable.
