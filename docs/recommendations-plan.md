# Personalized Practice Recommendations Plan

## Goal

Plan simple, honest personalized recommendations for AccentIQ V3 before implementing them.

Recommendations should help learners decide what to practice next using data AccentIQ already has:

- saved pronunciation history
- saved favorites
- most used accent
- accents not practiced yet
- practice count and streak state
- local preferences such as default accent, last used accent, and practice goal

Recommendations must not pretend AccentIQ has measured spoken accuracy, weak sounds, fluency, or audio quality. V3 still has no raw audio upload, no raw audio storage, and no real voice scoring.

## Files Inspected

Planning and prior dashboard work:

- `docs/v3-plan.md`
- `docs/streaks-plan.md`
- `docs/progress-dashboard-plan.md`

Frontend:

- `client/src/pages/Progress.tsx`
- `client/src/pages/Pronunciation.tsx`
- `client/src/services/api.ts`
- `client/src/types/pronunciation.ts`
- `client/src/utils/preferences.ts`
- `client/src/pages/Settings.tsx`

Backend:

- `server/src/modules/pronunciation/pronunciation.constants.ts`

## Current Data Available

The Progress page already loads:

```txt
GET /api/v1/pronunciation/history
GET /api/v1/pronunciation/favorites
```

Available history fields:

- `id`
- `text`
- `accent`
- `phonetic`
- `syllables`
- `tips`
- `createdAt`

Available favorite fields:

- `id`
- `text`
- `normalizedText`
- `accent`
- `phonetic`
- `syllables`
- `mouthTip`
- `tips`
- `exampleSentence`
- `createdAt`

Available local preferences:

- `defaultAccent`
- `practiceGoal`
- `showTipsByDefault`
- `rememberLastAccent`
- `lastUsedAccent`

Current Progress summary already derives:

- total saved practice items
- unique practiced words or phrases
- favorite count
- accents practiced
- most practiced accent
- current streak
- best streak
- practice day count
- weekly practice rhythm
- recent practice
- favorite review queue

This is enough for activity-based recommendations. It is not enough for accuracy-based recommendations.

## Recommendation Principles

Recommendations should be:

- transparent
- simple
- based on visible saved data
- helpful even for new users
- easy to explain in one sentence
- optional, not judgmental
- mobile-friendly

Recommendations should say why they appear.

Good framing:

```txt
Based on saved favorites.
Based on your recent practice.
Based on accents you have not tried yet.
Based on your current practice rhythm.
```

Avoid vague or inflated framing:

```txt
AI found your weak sound.
AccentIQ detected pronunciation mistakes.
Your voice score is low.
You are bad at this accent.
```

## Recommendation Types

### 1. Favorite Review

Signal:

- user has saved favorites

Purpose:

- encourage review of saved words
- make favorites useful beyond storage

Example copy:

```txt
Review three saved favorites today.
```

Supporting detail:

```txt
You have saved favorite words. Repeating them is a steady way to build confidence.
```

Suggested words:

- most recent 3 favorites

Action:

- link to `/pronunciation`
- show the suggested favorite words in the recommendation card
- optionally add prefill later if simple

### 2. Recent Practice Follow-Up

Signal:

- user has recent history

Purpose:

- invite another pass on recent words
- avoid pretending AccentIQ knows the word was weak

Example copy:

```txt
Repeat one recent practice word.
```

Supporting detail:

```txt
Revisiting a recent word helps the guidance stay familiar.
```

Suggested words:

- latest 2 or 3 unique history items

Action:

- link to `/pronunciation`
- show suggested words

### 3. Accent Variety

Signal:

- user has practiced mostly one accent
- or user has unused accents available

Purpose:

- encourage comparison across English accents
- make expanded accent support more visible

Example copy:

```txt
Try a different accent for comparison.
```

Supporting detail:

```txt
You have practiced mostly American English. Try British English next to compare rhythm and vowel choices.
```

Suggested accent:

- first unused accent if any
- otherwise a different accent from the most practiced one

Suggested words:

- use the last practiced word if history exists
- otherwise use a safe starter word such as `schedule`

Action:

- link to `/pronunciation`
- show target accent and word

### 4. New User Starter Path

Signal:

- logged-in user has no history
- or guest user is viewing Progress

Purpose:

- give a low-friction starting point
- avoid an empty dashboard feeling cold

Example copy:

```txt
Start with three comfortable words.
```

Suggested words:

```txt
comfortable
schedule
water
```

Supporting detail:

```txt
These are useful starter words for hearing syllables, stress, and accent differences.
```

Action:

- link to `/pronunciation`

Guest note:

- explain that recommendations can become more personal after login because saved history and favorites are account-based.

### 5. Low Practice Count

Signal:

- logged-in user has 1 to 4 saved history items

Purpose:

- nudge toward enough data for a useful dashboard

Example copy:

```txt
Build your first five saved practice items.
```

Supporting detail:

```txt
You have a few saved checks. Add a couple more to make your progress dashboard more useful.
```

Action:

- link to `/pronunciation`
- suggest 2 or 3 starter words

### 6. Streak Recovery Or Continuation

Signal:

- current streak is active
- or best streak exists but current streak is `0`

Purpose:

- connect recommendations to Checkpoint 7 streaks
- keep copy activity-based

Examples:

```txt
Save one practice check today to keep your streak active.
```

```txt
Restart your streak with one short word.
```

Supporting detail:

```txt
Streaks count saved practice days, not pronunciation scores.
```

Action:

- link to `/pronunciation`

### 7. Practice Goal Preference

Signal:

- local `practiceGoal`

Purpose:

- lightly tailor recommendation volume without creating new backend state

Suggested behavior:

- `CASUAL`: show 2 recommendations
- `REGULAR`: show 3 recommendations
- `INTENSIVE`: show 4 recommendations

Do not use practice goal to imply performance level.

## Recommendation Priority

Checkpoint 9 should keep the list short. Suggested priority:

1. Empty state starter path if no saved history exists.
2. Streak continuation or recovery.
3. Favorite review if favorites exist.
4. Accent variety if accents are unused or one accent dominates.
5. Recent practice follow-up.
6. Low practice count nudge.

Limit visible recommendations to 3 by default.

If using practice goal:

- show 2 for `CASUAL`
- show 3 for `REGULAR`
- show 4 for `INTENSIVE`

## Suggested Data Shape

Checkpoint 9 can keep this inside `Progress.tsx` or move it into a small helper if it becomes bulky.

Possible type:

```ts
type PracticeRecommendation = {
    id: string;
    title: string;
    reason: string;
    actionLabel: string;
    to: string;
    suggestedWords?: string[];
    suggestedAccent?: string;
};
```

Possible helper:

```ts
function getPracticeRecommendations(input: {
    history: PronunciationHistoryItem[];
    favorites: PronunciationFavoriteItem[];
    accentRows: { accent: string; label: string; count: number }[];
    mostPracticedAccent?: { accent: string; label: string; count: number };
    currentStreakDays: number;
    bestStreakDays: number;
    practiceGoal: PracticeGoal;
}): PracticeRecommendation[]
```

Keep it deterministic and easy to read.

## Clickable Behavior

Current `Pronunciation.tsx` does not read URL query parameters for prefilled text or accent.

Recommended Checkpoint 9 decision:

Start simple:

- recommendations link to `/pronunciation`
- cards display suggested words and target accent
- the user manually types or uses the shown suggestion

Optional small enhancement:

- add query parameters such as:

```txt
/pronunciation?text=schedule&accent=UK
```

Only add this if it stays small and safe:

- read query params once on Pronunciation load
- validate accent against enabled options before selecting it
- trim text and respect the max text length
- do not auto-submit analysis
- user still clicks Analyze

Do not add auto-analysis from recommendations in V3.

## Guest Behavior

Guest users can see general starter recommendations, but should not see fake personalization.

Guest copy:

```txt
Practice as a guest, or login to save history and receive recommendations based on your own practice.
```

Guest recommendations:

- start with comfortable, schedule, water
- try one accent comparison
- login prompt for saved progress

No guest recommendation should imply that AccentIQ remembers prior guest practice.

## Logged-In Empty State

Logged-in users with no history should see starter recommendations and a clear first step.

Recommended copy:

```txt
Start with three comfortable words.
```

```txt
Once you save practice, recommendations can use your history, favorites, and accent coverage.
```

Suggested words:

- comfortable
- schedule
- water

## Safety Rules

Do not claim:

- AccentIQ detected weak sounds
- AccentIQ scored the user's voice
- AccentIQ diagnosed speech problems
- AccentIQ knows pronunciation accuracy
- recommendations are medical or therapeutic advice

Do not add:

- raw audio upload
- raw audio storage
- microphone recording beyond existing browser speech-to-text
- new AI provider calls for recommendations
- new database fields for V3 recommendations

Use copy like:

```txt
Based on saved practice.
Based on your favorites.
Based on accent coverage.
Based on recent activity.
```

## Frontend Implementation Plan For Checkpoint 9

Likely touched files:

```txt
client/src/pages/Progress.tsx
client/src/index.css
```

Optional if the helper becomes large:

```txt
client/src/utils/recommendations.ts
```

Recommended tasks:

1. Add a "Recommended practice" section to Progress.
2. Generate a short list of recommendations from history, favorites, accent counts, streak status, and local practice goal.
3. Show why each recommendation appears.
4. Show suggested words or target accent when relevant.
5. Link each recommendation to `/pronunciation`.
6. Keep starter recommendations for guests and empty dashboards.
7. Do not claim audio analysis, weak sound detection, or pronunciation scoring.
8. Keep mobile and dark mode readable.

## Testing Checklist For Checkpoint 9

Build:

```powershell
cd client
npm run build
cd ..
```

Manual tests:

- Guest Progress page shows general starter recommendations and login prompt.
- Logged-in user with no history sees starter recommendations.
- Logged-in user with favorites sees favorite review recommendation.
- User with mostly one accent sees accent variety recommendation.
- User with recent history sees recent practice recommendation.
- User with active streak sees streak continuation recommendation.
- User with inactive streak sees restart recommendation.
- Recommendations do not claim audio scoring.
- Recommendation links open Pronunciation.
- Progress dashboard still loads.
- Mobile layout works.
- Dark mode works.

## Success Criteria

Checkpoint 9 is complete when:

- Progress includes a "Recommended practice" section.
- Recommendations are generated from existing saved data only.
- Recommendation copy is transparent and honest.
- Empty and guest states are helpful.
- No backend, Prisma, raw audio, or voice-scoring changes are added unless explicitly needed.
- Client build passes.
