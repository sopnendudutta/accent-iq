# AccentIQ V3 Release Summary

## Overview

AccentIQ V3 improves the app from a working pronunciation practice tool into a portfolio-ready AI pronunciation learning product.

V3 focuses on AI pronunciation guidance, optional Google OAuth, progress insights, streaks, recommendations, safety documentation, and a polished production-ready experience.

## Completed V3 Features

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

AccentIQ V3 includes more English accent options for pronunciation practice.

Supported accents include the original accents plus expanded English variants such as Canadian, Irish, New Zealand, South African, and Singapore English.

### 7. Progress dashboard

AccentIQ V3 includes a progress dashboard using user practice data.

The dashboard helps users understand:

- total practice attempts
- saved favorites
- recent practice
- most used accent
- practice activity

Guest users see a login-focused state.

### 8. Google OAuth

AccentIQ V3 adds Google OAuth as an optional social login path while preserving email auth and guest pronunciation practice.

### 9. Streaks and recommendations

The Progress page now includes activity-based streaks and recommended practice suggestions powered by saved history and favorites.

### 10. Audio privacy planning

V3 documents the product boundary clearly: browser voice-to-text may fill the text box, but AccentIQ does not upload raw audio, store raw audio, or provide real voice pronunciation scoring.

## Safety Decisions

V3 intentionally does not include:

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

Before merging `dev` into `main`:

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
- Google OAuth works when configured
- streaks work
- recommendations work
- more accents work
- mobile layout works
- dark mode works
- no `.env` committed
- no secrets committed

## Known Limitations

- Real voice scoring is not included yet.
- Raw audio upload is not included yet.
- Meta/Facebook OAuth is postponed until the Google OAuth flow is stable.
- Recommendations are activity-based and do not claim to detect spoken accuracy.

## Final Decision

AccentIQ V3 is ready for merge only after manual review confirms that core features still work and all V3 features are stable.
