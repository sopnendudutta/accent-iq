# AccentIQ V2 Checkpoint 11 - Progress Dashboard Planning

## Goal

Plan a progress dashboard that helps logged-in learners understand their practice consistency without pretending AccentIQ can score spoken audio.

The dashboard should feel like a calm learning summary, not a dense analytics product. It should use the warm full-screen AccentIQ design direction and keep metrics teacher-like, readable, and encouraging.

## Current Data Available

AccentIQ already stores enough data for a useful first progress dashboard:

- `PronunciationHistory`
  - `text`
  - `accent`
  - `inputType`
  - `phonetic`
  - `syllables`
  - `tips`
  - `result`
  - `createdAt`
  - `userId`
- `PronunciationFavorite`
  - `text`
  - `normalizedText`
  - `accent`
  - `phonetic`
  - `mouthTip`
  - `tips`
  - `exampleSentence`
  - `createdAt`
- Local preferences
  - default accent
  - practice goal
  - tips visibility
  - last used accent

This is enough for practice activity, coverage, and review insights. It is not enough for pronunciation accuracy, spoken fluency, or audio quality scores.

## MVP User Stories

1. As a logged-in learner, I can see how many pronunciation items I have practiced.
2. As a logged-in learner, I can see how many unique words or phrases I have practiced.
3. As a logged-in learner, I can see which accents I have practiced.
4. As a logged-in learner, I can see a simple recent activity timeline.
5. As a logged-in learner, I can see my current practice streak based on saved history days.
6. As a logged-in learner, I can see favorite words that are useful to review.
7. As a guest, I see a friendly empty state that explains progress tracking requires login.

## MVP Metrics

Use only saved logged-in data.

- `totalPracticeItems`: count of history records.
- `uniquePracticeItems`: count of distinct `normalizedText` values, derived from `text.toLowerCase().trim()`.
- `favoriteCount`: count of favorites.
- `accentCount`: count of distinct accents practiced.
- `mostPracticedAccent`: accent with the highest history count.
- `currentStreakDays`: consecutive calendar days with at least one history item, ending today or yesterday.
- `lastPracticeDate`: most recent history `createdAt`.
- `practiceThisWeek`: history count from the last 7 days.
- `recentPractice`: latest 5 history items.
- `reviewQueue`: latest 4 favorites.

Do not show:

- pronunciation accuracy score
- voice score
- confidence score
- audio analysis
- medical or speech disorder interpretation

## Recommended Checkpoint 12 Approach

Build the first dashboard with existing APIs:

- `GET /api/v1/pronunciation/history`
- `GET /api/v1/pronunciation/favorites`
- existing auth state from `App.tsx`

Compute MVP metrics on the frontend for Checkpoint 12. This avoids a database migration and keeps the dashboard implementation low-risk.

After the MVP is stable, a later checkpoint can add a backend summary endpoint if history volume becomes large:

```txt
GET /api/v1/pronunciation/progress
```

That endpoint can aggregate with Prisma when needed, but it is not required for the first implementation.

## Proposed Frontend Route

Add a new route:

```txt
/progress
```

Likely files:

- `client/src/App.tsx`
- `client/src/components/layout/Navbar.tsx`
- `client/src/pages/Progress.tsx`
- `client/src/services/api.ts`
- `client/src/types/pronunciation.ts`
- `client/src/index.css`

## Proposed Page Structure

Use full-screen spacious layout, not a card-heavy dashboard.

1. Hero band
   - Title: `Your practice progress`
   - Supporting copy: saved practice only, no audio scoring claim.
   - Login CTA for guests.

2. Summary strip
   - Total practice
   - Unique words
   - Current streak
   - Accents practiced

3. Weekly practice section
   - Simple 7-day activity row.
   - Avoid complex charting libraries for MVP.

4. Accent coverage section
   - Show accents practiced and counts.
   - Encourage trying unused accents.

5. Review section
   - Favorite words for review.
   - Recent practice list.

6. Empty states
   - Guest: login/register CTA.
   - Logged-in with no history: link to Pronunciation page.

## UX Rules

- Keep language encouraging and concrete.
- Say `saved practice`, not `performance`, when describing history.
- Avoid claiming improvement unless future scoring or longitudinal evidence exists.
- Do not use heavy charts for MVP.
- Do not put a dashboard inside a stack of cards.
- Mobile should prioritize the summary, then recent practice, then favorites.

## Data Derivation Notes

Normalize text for unique counts:

```ts
text.trim().toLowerCase()
```

Group practice days with local calendar dates:

```ts
new Date(createdAt).toDateString()
```

For `currentStreakDays`:

1. Create a set of local practice dates.
2. Start from today.
3. If today has no practice but yesterday does, start from yesterday.
4. Count backwards while each previous date exists.

This makes streaks forgiving for a learner who has not practiced yet today.

## Checkpoint 12 Acceptance Criteria

Checkpoint 12 is complete when:

- `/progress` route exists.
- Navbar links to Progress.
- Logged-in users see metrics from saved history/favorites.
- Guests see a clear login/register empty state.
- Dashboard does not claim real audio scoring or pronunciation accuracy.
- Existing Pronunciation, History, Favorites, Settings, and Auth flows still work.
- Client build passes.
- Changes are committed and pushed on `dev`.

## Future Enhancements

Later checkpoints can add:

- backend progress summary endpoint
- server-side streak calculation
- daily practice goals
- practice recommendations
- weekly email-style recap
- audio scoring metrics after privacy/security planning
