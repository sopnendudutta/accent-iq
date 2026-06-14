# CODEX_TASKS.md

# AccentIQ V2 Tasks for Codex

## Current checkpoint

Continue from:

```txt
V2 Checkpoint 6.6 — Rebuild global index.css tokens and components
```

The goal is to redesign the global CSS foundation so AccentIQ feels like a real full-screen product website, not a card-heavy dashboard.

## Important rules

Before making any change, check:

```powershell
git status
git branch
```

Expected:

```txt
On branch dev
nothing to commit, working tree clean
```

If not on dev:

```powershell
git checkout dev
```

Do not touch `main`.

Do not modify backend for Checkpoint 6.6.

Do not modify database or Prisma.

Do not add raw audio upload.

Do not add real voice scoring.

Do not commit `.env`.

## Current design direction

AccentIQ should look like:

```txt
Full-screen warm AI pronunciation website
Warm cream / soft parchment background
Dark charcoal readable text
Terracotta/coral accent
Large premium inputs
Clean confident buttons
Teacher-like result section
Spacious mobile layout
```

Avoid:

```txt
Card-heavy dashboard layout
Too many boxes
Too many pills
Too many gradients
Harsh shadows
Crowded cards
Tiny labels
Technical pronunciation clutter
```

## Checkpoint 6.6 task

### Main file to edit

```txt
client/src/index.css
```

### Do not edit unless necessary

```txt
client/src/App.css
```

`App.css` is intentionally blank.

### Strategy

Do not delete the full existing `index.css` blindly.

The safer approach is:

1. Preserve existing class names.
2. Add a new V2 override layer at the bottom of `client/src/index.css`.
3. Make Home and Pronunciation full-screen and less card-heavy.
4. Keep cards for About, Settings, Auth, and review items.
5. Test all pages after editing.

## What the new CSS layer should accomplish

### Global

* Warm parchment background
* Better typography rhythm
* Full-width page shell
* Fewer boxed surfaces
* Softer borders
* Softer shadows
* Better spacing

### Home page

Home should become a full-screen landing page.

Expected feeling:

```txt
Large confident hero
Left-aligned or spacious website-style content
Clear primary CTA
Clear secondary CTA
Minimal card usage
Highlights can be simple rows/sections instead of heavy cards
```

Home should not feel like a boxed card.

### Pronunciation page

Pronunciation should become a full-screen learning workspace.

Expected structure:

```txt
Hero / intro section
Large input area
Accent selector
Analyze button
Voice-to-text helper
Teacher-like result section
History/favorites lower down
```

Avoid many nested cards.

The result should show only:

```txt
Phonetic spelling
Syllables
Mouth / tongue / lip guidance
Practice tips
Example sentence
```

### Result section

The result should feel like a teacher explaining clearly, not a technical dashboard.

Phonetic spelling should be visually prominent.

Guidance and tips should be easy to scan.

### About and Settings

Cards are allowed here.

Keep About and Settings structured, clean, and card-based.

### Auth pages

Auth pages can remain structured with cards, but should look warmer and more premium.

### History/Favorites

History and favorites can use light review cards, but should not make the whole app feel like a dashboard.

## Suggested CSS override section name

Add this comment at the bottom of `client/src/index.css`:

```css
/* =========================================================
   V2 Checkpoint 6.6 — AccentIQ Full-Screen Product Design
   Direction: warm full-screen pronunciation website,
   not a card-heavy dashboard.
   ========================================================= */
```

Then add overrides below it.

## Suggested design token direction

Use tokens similar to:

```css
:root {
  --color-bg: #f3eee5;
  --color-surface: #fffaf2;
  --color-surface-soft: #f8efe3;
  --color-surface-muted: #efe4d4;

  --color-text: #29231d;
  --color-heading: #191512;
  --color-muted: #6f665d;

  --color-border: rgba(43, 35, 27, 0.12);
  --color-border-strong: rgba(43, 35, 27, 0.2);

  --color-coral: #df5a4d;
  --color-coral-hover: #c94d42;
  --color-coral-soft: rgba(223, 90, 77, 0.12);

  --container-width: 1180px;
}
```

Keep dark mode readable and warm.

## Required testing after Checkpoint 6.6

Run:

```powershell
cd client
npm run build
cd ..
```

Then run the frontend:

```powershell
cd client
npm run dev
```

Manually check:

```txt
Home
Pronunciation
Login
Register
Settings
About
NotFound
Light mode
Dark mode
Mobile width
Navbar hamburger
Pronunciation result card/section
History/Favorites sections
```

The goal is not only “build passes.” The design must visually feel better.

## Commit for Checkpoint 6.6

If the build passes and the UI looks correct:

```powershell
git status
git add client/src/index.css
git commit -m "style: shift AccentIQ to full-screen product design"
git push origin dev
```

## Checkpoint 6.6 success condition

Checkpoint 6.6 is complete when:

```txt
client build passes
Home is full-screen and not boxed
Pronunciation feels like a full-screen learning workspace
About and Settings still use cards
Mobile is spacious
Dark mode is readable
Changes are pushed to origin/dev
```

---

# Next checkpoint after 6.6

## V2 Checkpoint 6.7 — Redesign Home + Pronunciation UI

Only start this after Checkpoint 6.6 is committed and pushed.

Likely files:

```txt
client/src/pages/Home.tsx
client/src/pages/Pronunciation.tsx
client/src/index.css
```

Goal:

* Adjust React markup if CSS alone is not enough.
* Make Home more like a real product landing page.
* Make Pronunciation feel like the core product workspace.
* Keep result UI simple.
* Do not change backend logic.

Testing:

```powershell
cd client
npm run build
cd ..
```

Manual UI check for Home and Pronunciation.

Commit suggestion:

```powershell
git add client/src/pages/Home.tsx client/src/pages/Pronunciation.tsx client/src/index.css
git commit -m "style: redesign home and pronunciation experience"
git push origin dev
```

---

# Next checkpoint after 6.7

## V2 Checkpoint 6.8 — Mobile polish + final design QA

Likely file:

```txt
client/src/index.css
```

Possibly:

```txt
client/src/pages/Home.tsx
client/src/pages/Pronunciation.tsx
```

Goal:

* Fix mobile spacing
* Fix navbar hamburger layout
* Fix input/result layout on small screens
* Check iPad/tablet widths
* Check dark mode
* Check auth/settings/about still look good

Testing:

```powershell
cd client
npm run build
cd ..
```

Manual widths to check:

```txt
Desktop
Laptop
iPad/tablet
Mobile around 390px
Very small mobile around 320px
```

Commit suggestion:

```powershell
git add client/src/index.css client/src/pages/Home.tsx client/src/pages/Pronunciation.tsx
git commit -m "style: polish responsive AccentIQ design"
git push origin dev
```

---

# After Checkpoint 6.8

Move to new chat starting from:

```txt
Checkpoint 7 — Production AI setup on Render
```

Remaining V2 checkpoints after design:

```txt
Checkpoint 7: Production AI setup on Render
Checkpoint 8: Deploy and test AI engine safely
Checkpoint 9: Frontend AI polish
Checkpoint 10: More accents expansion
Checkpoint 11: Progress dashboard planning
Checkpoint 12: Progress dashboard implementation
```

## Production AI environment variables for later

Do not do this during 6.6.

Later on Render, backend env should include:

```env
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=real_key
```

Do not expose the real Gemini key.
