# Daily Practice Streaks Plan

## Goal

Plan AccentIQ V3 daily practice streaks before making any database changes.

The safest V3 decision is to calculate streaks from existing saved pronunciation history. This keeps streaks honest, avoids fake progress, and preserves the V1/V2 behavior where guests can practice freely but only logged-in users build saved history.

## Files Inspected

Backend:

- `server/prisma/schema.prisma`
- `server/src/modules/pronunciation/pronunciation.service.ts`
- `server/src/modules/pronunciation/pronunciation.controller.ts`
- `server/src/modules/pronunciation/pronunciation.routes.ts`

Frontend:

- `client/src/pages/Progress.tsx`
- `client/src/services/api.ts`
- `client/src/types/pronunciation.ts`

Planning:

- `docs/v3-plan.md`

## Current Data Model

The current Prisma schema already has saved pronunciation history:

```prisma
model PronunciationHistory {
  id        String   @id @default(cuid())
  inputType PronunciationInputType @default(TEXT)
  text      String
  accent    Accent
  phonetic  String?
  syllables Json?
  tips      Json?
  result    Json?
  userId    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

When a logged-in user analyzes text, `pronunciationService.analyzePronunciation()` creates a `PronunciationHistory` row with `createdAt`.

Guest users can analyze pronunciation, but no `PronunciationHistory` row is saved because there is no `userId`.

The frontend already fetches history through:

```txt
GET /api/v1/pronunciation/history
```

and types each history item with:

```ts
createdAt: string;
```

## Existing Progress Page Behavior

`client/src/pages/Progress.tsx` already calculates:

- total saved practice items
- unique practiced words or phrases
- favorite count
- accents practiced
- weekly practice rhythm
- most practiced accent
- last practice date
- current streak

Current streak is already based on saved history dates using local calendar days.

Checkpoint 7 should improve and clarify that existing behavior instead of creating a parallel streak system.

## What Counts As Practice

Recommended V3 rule:

A practice day counts when a logged-in user has at least one saved pronunciation history item on that local calendar date.

This means:

- One saved analysis counts the day.
- Multiple saved analyses on the same day still count as one streak day.
- Favorites alone do not count as practice unless they came from a saved analysis day.
- Viewing Progress does not count.
- Refreshing history does not count.
- Guest practice does not count because it is not saved.
- Browser speech-to-text does not count by itself; it only counts if the user analyzes the transcript while logged in and a history row is saved.

This is activity tracking, not pronunciation scoring.

## Timezone Handling

Recommended V3 behavior:

Use the user's browser local timezone when grouping `createdAt` timestamps into calendar days.

Why:

- The Progress dashboard is a learner-facing view.
- Learners expect "today" and "yesterday" to match their local clock.
- The current frontend already uses local date helpers.
- No backend timezone preferences exist yet.

Implementation guidance:

- Convert each history `createdAt` value to a JavaScript `Date`.
- Normalize it to a local date key such as `YYYY-MM-DD`.
- Compare against local start-of-day values.
- Do not use UTC grouping in the frontend unless the UI clearly says so.

Known limitation:

If a user travels across timezones, historical day grouping may shift relative to their current browser timezone. This is acceptable for V3 and should be documented as a simple activity dashboard limitation.

Future improvement:

If timezone precision becomes important, add a user timezone preference and calculate streaks on the backend using that saved preference.

## Logged-In Behavior

Logged-in users should see streaks based only on their own saved history.

Recommended Progress page values:

- Current streak: consecutive practice days ending today or yesterday.
- Best streak: longest consecutive run of saved practice days.
- Last practice: latest saved history item date.
- This week: saved practice count in the last seven local days.

Current streak rule:

- If the user practiced today, count backward from today.
- If the user did not practice today but practiced yesterday, keep the streak active and count backward from yesterday.
- If the user practiced neither today nor yesterday, current streak is `0`.

Best streak rule:

- Build the unique set of saved local practice dates.
- Sort the dates ascending.
- Count consecutive day runs.
- Return the longest run.

## Guest Behavior

Guest users should not receive a fake streak.

Recommended guest UI:

- Keep the existing login prompt.
- Explain that progress and streaks use saved practice only.
- Keep pronunciation practice available without login.
- Do not store anonymous streaks in local storage for V3.

Why not local guest streaks:

- It could imply saved progress exists when it does not.
- It could diverge from account history after login.
- It adds more state to reconcile later.

## Empty State

Logged-in users with no saved history should see:

- Current streak: `0`
- Best streak: `0`
- Friendly copy: "Practice a word to start your streak."
- CTA to `/pronunciation`

The empty state should not imply the user failed. It should feel like a starting line.

## Database Decision

No database change is needed for V3 streaks.

Reasons:

- `PronunciationHistory.createdAt` already gives the required day signal.
- History rows are already user-scoped.
- The Progress page already fetches all data needed for basic streaks.
- A separate streak table would create duplication and sync risk.

Do not add Prisma fields in Checkpoint 7 unless implementation discovers a serious performance or correctness issue.

## Backend Decision

No backend route is required for Checkpoint 7.

Recommended implementation:

- Keep using `GET /api/v1/pronunciation/history`.
- Calculate current streak and best streak on the frontend from returned history.

Possible future backend improvement:

Add a dedicated analytics endpoint if history becomes too large to fetch for dashboard use:

```txt
GET /api/v1/pronunciation/progress
```

That endpoint could return precomputed summary fields without exposing the full history list. This is not necessary for V3 unless performance becomes a problem.

## Frontend Implementation Plan For Checkpoint 7

Likely touched files:

```txt
client/src/pages/Progress.tsx
client/src/index.css
```

Optional if useful:

```txt
client/src/utils/streaks.ts
client/src/types/pronunciation.ts
```

Recommended tasks:

1. Keep the existing `currentStreakDays` calculation or move it into a small helper.
2. Add `bestStreakDays`.
3. Ensure current streak and best streak both use unique local date keys.
4. Make copy explicit: "Saved practice days", not "voice score" or "accuracy".
5. Show a small streak-focused section on Progress:
   - current streak
   - best streak
   - last practice
   - this week
6. Keep guest and empty states honest.
7. Avoid fake streaks, badges, or gamified claims that are not backed by history.

## Suggested Helper Shape

If extraction is helpful:

```ts
type PracticeStreakSummary = {
    currentStreakDays: number;
    bestStreakDays: number;
    practiceDayCount: number;
};
```

Possible functions:

```ts
getLocalDateKey(date: Date): string
getUniquePracticeDays(history: PronunciationHistoryItem[]): string[]
calculateCurrentStreakFromDays(dayKeys: string[]): number
calculateBestStreakFromDays(dayKeys: string[]): number
getPracticeStreakSummary(history: PronunciationHistoryItem[]): PracticeStreakSummary
```

Keep the helper readable. This does not need a complex date library in V3.

## UI Copy Guidelines

Use copy like:

- "Current streak"
- "Best streak"
- "Saved practice days"
- "Practice today to keep your streak active."
- "Your streak is based on logged-in pronunciation checks."

Avoid copy like:

- "Speaking accuracy streak"
- "Voice score streak"
- "AI detected improvement"
- "Pronunciation mastery"

AccentIQ does not have real voice scoring yet.

## Testing Checklist For Checkpoint 7

Frontend build:

```powershell
cd client
npm run build
cd ..
```

Manual tests:

- Guest Progress page shows login prompt and no fake streak.
- Logged-in user with no history sees `0` streak values.
- Logged-in user with one history item today sees current streak `1`.
- Logged-in user with history today and yesterday sees current streak `2`.
- Logged-in user with a gap before today gets the correct current streak.
- Logged-in user with older consecutive history gets the correct best streak.
- Weekly rhythm still renders.
- Accent coverage still renders.
- Favorites review queue still renders.
- Mobile layout stays readable.
- Dark mode stays readable.

## Success Criteria

Checkpoint 7 is complete when:

- Streaks are calculated from real saved pronunciation history.
- Current streak and best streak are shown clearly.
- Guest users do not receive fake streaks.
- Logged-in empty state is friendly.
- No database migration is added unless truly necessary.
- No raw audio upload or voice scoring claim is introduced.
- Client build passes.
