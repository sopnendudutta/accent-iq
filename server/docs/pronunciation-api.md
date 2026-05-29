# AccentIQ Pronunciation API Documentation

This document explains the backend pronunciation API routes for AccentIQ V1.

Frontend is not started yet. These routes are currently tested using Postman or Thunder Client.

---

## Base URL

```txt
http://localhost:5000/api/v1/pronunciation
```

---

## Current Feature Rules

- Login/signup is optional in V1.
- Guest users can analyze pronunciation.
- Logged-in users can analyze pronunciation and save history.
- Voice input is planned for later but not enabled yet.
- Current working input type is `TEXT`.
- Pronunciation results are currently mocked/prepared for backend structure.
- Real AI/audio pronunciation logic will be added later.

---

## Supported Accents

```txt
US
UK
AUSTRALIAN
INDIAN
```

| Accent Value | Label |
|---|---|
| `US` | American English |
| `UK` | British English |
| `AUSTRALIAN` | Australian English |
| `INDIAN` | Indian English |

---

## Supported Input Types

```txt
TEXT
VOICE
```

| Input Type | Status |
|---|---|
| `TEXT` | Working |
| `VOICE` | Planned, returns `501 Not Implemented` for now |

---

# 1. Get Pronunciation Options

## Route

```http
GET /api/v1/pronunciation/options
```

## Access

Guest + logged-in users.

No token required.

## Purpose

Returns supported accents, input types, limits, and feature availability.

This route helps the future frontend avoid hardcoding available accents and input types.

## Success Response Example

```json
{
  "success": true,
  "message": "Pronunciation options fetched successfully",
  "data": {
    "accents": [
      {
        "value": "US",
        "label": "American English",
        "exampleWord": "schedule",
        "examplePronunciation": "SKEH-jool",
        "enabled": true
      },
      {
        "value": "UK",
        "label": "British English",
        "exampleWord": "schedule",
        "examplePronunciation": "SHED-yool",
        "enabled": true
      },
      {
        "value": "AUSTRALIAN",
        "label": "Australian English",
        "exampleWord": "schedule",
        "examplePronunciation": "SHED-yool",
        "enabled": true
      },
      {
        "value": "INDIAN",
        "label": "Indian English",
        "exampleWord": "schedule",
        "examplePronunciation": "SKEH-jool",
        "enabled": true
      }
    ],
    "inputTypes": [
      {
        "value": "TEXT",
        "label": "Text input",
        "enabled": true
      },
      {
        "value": "VOICE",
        "label": "Voice input",
        "enabled": false,
        "message": "Voice input is planned but not enabled yet."
      }
    ],
    "limits": {
      "maxTextLength": 200
    },
    "features": {
      "guestAnalysis": true,
      "loggedInHistory": true,
      "voiceInput": false,
      "audioScoring": false,
      "favorites": false,
      "progressTracking": false
    }
  }
}
```

---

# 2. Analyze Pronunciation

## Route

```http
POST /api/v1/pronunciation/analyze
```

## Access

Guest + logged-in users.

## Auth Behavior

| User Type | Token Required | History Saved |
|---|---|---|
| Guest | No | No |
| Logged-in | Yes | Yes |

For logged-in users, send:

```txt
Authorization: Bearer YOUR_TOKEN
```

---

## Request Body: Old Supported Format

This still works because `inputType` defaults to `TEXT`.

```json
{
  "text": "schedule",
  "accent": "US"
}
```

---

## Request Body: New Recommended Format

```json
{
  "inputType": "TEXT",
  "text": "schedule",
  "accent": "US"
}
```

---

## Success Response Example

```json
{
  "success": true,
  "message": "Pronunciation analyzed successfully",
  "data": {
    "inputType": "TEXT",
    "text": "schedule",
    "normalizedText": "schedule",
    "accent": "US",
    "pronunciation": {
      "phonetic": "SKEH-jool",
      "ipa": "/ˈskedʒuːl/",
      "syllables": ["SKEH", "jool"],
      "stressPattern": "First syllable stress"
    },
    "guidance": {
      "mouthTip": "Start with a clear SK sound.",
      "commonMistake": "Avoid saying the word too flat or too fast.",
      "tips": [
        "Say the first syllable clearly.",
        "Pause slightly between syllables while practicing.",
        "Repeat slowly first, then increase your speed naturally."
      ]
    },
    "practice": {
      "slowPractice": "SKEH ... jool",
      "exampleSentence": "I need to check my schedule.",
      "repeatCount": 5
    },
    "saved": false
  }
}
```

---

## UK Accent Example

Request:

```json
{
  "inputType": "TEXT",
  "text": "schedule",
  "accent": "UK"
}
```

Expected pronunciation difference:

```json
{
  "phonetic": "SHED-yool",
  "ipa": "/ˈʃedjuːl/"
}
```

---

## Random Word Example

Request:

```json
{
  "inputType": "TEXT",
  "text": "hello",
  "accent": "INDIAN"
}
```

Expected response includes placeholder pronunciation data:

```json
{
  "phonetic": "hello pronunciation for INDIAN",
  "ipa": "IPA will be generated later",
  "stressPattern": "Stress pattern will be generated later"
}
```

---

## Voice Input Placeholder

Voice input is not enabled yet.

Request:

```json
{
  "inputType": "VOICE",
  "text": "schedule",
  "accent": "US"
}
```

Expected status:

```txt
501 Not Implemented
```

Expected response:

```json
{
  "success": false,
  "message": "Voice pronunciation input is planned but not enabled yet. Use TEXT input for now."
}
```

---

# 3. Get Pronunciation History

## Route

```http
GET /api/v1/pronunciation/history
```

## Access

Logged-in users only.

## Required Header

```txt
Authorization: Bearer YOUR_TOKEN
```

## Purpose

Returns pronunciation history for the currently logged-in user.

Users can only access their own history.

## Success Response Example

```json
{
  "success": true,
  "message": "Pronunciation history fetched successfully",
  "data": [
    {
      "id": "history_id_here",
      "inputType": "TEXT",
      "text": "schedule",
      "accent": "US",
      "phonetic": "SKEH-jool",
      "syllables": ["SKEH", "jool"],
      "tips": [
        "Say the first syllable clearly.",
        "Pause slightly between syllables while practicing.",
        "Repeat slowly first, then increase your speed naturally."
      ],
      "result": {
        "inputType": "TEXT",
        "text": "schedule",
        "normalizedText": "schedule",
        "accent": "US",
        "pronunciation": {
          "phonetic": "SKEH-jool",
          "ipa": "/ˈskedʒuːl/",
          "syllables": ["SKEH", "jool"],
          "stressPattern": "First syllable stress"
        }
      },
      "userId": "user_id_here",
      "createdAt": "2026-05-29T00:00:00.000Z",
      "updatedAt": "2026-05-29T00:00:00.000Z"
    }
  ]
}
```

---

## Unauthorized Response

If no token is provided:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

# 4. Get One Pronunciation History Item

## Route

```http
GET /api/v1/pronunciation/history/:id
```

## Access

Logged-in users only.

## Required Header

```txt
Authorization: Bearer YOUR_TOKEN
```

## Example

```http
GET /api/v1/pronunciation/history/history_id_here
```

## Purpose

Returns one pronunciation history item for the currently logged-in user.

Users cannot access another user's history item.

## Success Response Example

```json
{
  "success": true,
  "message": "Pronunciation history item fetched successfully",
  "data": {
    "id": "history_id_here",
    "inputType": "TEXT",
    "text": "schedule",
    "accent": "US",
    "phonetic": "SKEH-jool",
    "syllables": ["SKEH", "jool"],
    "tips": [
      "Say the first syllable clearly.",
      "Pause slightly between syllables while practicing.",
      "Repeat slowly first, then increase your speed naturally."
    ],
    "result": {
      "inputType": "TEXT",
      "text": "schedule",
      "normalizedText": "schedule",
      "accent": "US"
    },
    "userId": "user_id_here",
    "createdAt": "2026-05-29T00:00:00.000Z",
    "updatedAt": "2026-05-29T00:00:00.000Z"
  }
}
```

## Not Found Response

```json
{
  "success": false,
  "message": "Pronunciation history item not found"
}
```

---

# 5. Delete One Pronunciation History Item

## Route

```http
DELETE /api/v1/pronunciation/history/:id
```

## Access

Logged-in users only.

## Required Header

```txt
Authorization: Bearer YOUR_TOKEN
```

## Example

```http
DELETE /api/v1/pronunciation/history/history_id_here
```

## Purpose

Deletes one pronunciation history item for the currently logged-in user.

Users cannot delete another user's history item.

## Success Response Example

```json
{
  "success": true,
  "message": "Pronunciation history item deleted successfully",
  "data": {
    "id": "history_id_here",
    "inputType": "TEXT",
    "text": "schedule",
    "accent": "US"
  }
}
```

## Not Found Response

```json
{
  "success": false,
  "message": "Pronunciation history item not found"
}
```

---

# Validation Rules

## Analyze Pronunciation

| Field | Required | Rule |
|---|---:|---|
| `inputType` | No | Defaults to `TEXT` |
| `text` | Yes for `TEXT` | Must be a string, max 200 characters |
| `accent` | Yes | Must be `US`, `UK`, `AUSTRALIAN`, or `INDIAN` |

---

# Error Test Cases

## Missing Text

Request:

```json
{
  "inputType": "TEXT",
  "accent": "US"
}
```

Expected: validation error.

---

## Invalid Accent

Request:

```json
{
  "inputType": "TEXT",
  "text": "schedule",
  "accent": "CANADIAN"
}
```

Expected: validation error.

Allowed accents:

```txt
US
UK
AUSTRALIAN
INDIAN
```

---

## Invalid Input Type

Request:

```json
{
  "inputType": "AUDIO",
  "text": "schedule",
  "accent": "US"
}
```

Expected: validation error.

Allowed input types:

```txt
TEXT
VOICE
```

---

## Text Too Long

Request:

```json
{
  "inputType": "TEXT",
  "text": "more than 200 characters here...",
  "accent": "US"
}
```

Expected: validation error.

---

# Postman Testing Checklist

## Guest Tests

- [ ] `GET /options` works without token
- [ ] `POST /analyze` with old body format works
- [ ] `POST /analyze` with `inputType: "TEXT"` works
- [ ] `POST /analyze` with `accent: "US"` works
- [ ] `POST /analyze` with `accent: "UK"` works
- [ ] `POST /analyze` with `accent: "AUSTRALIAN"` works
- [ ] `POST /analyze` with `accent: "INDIAN"` works
- [ ] `POST /analyze` with random text works
- [ ] `POST /analyze` with `inputType: "VOICE"` returns `501`
- [ ] Missing text fails
- [ ] Invalid accent fails
- [ ] Invalid input type fails
- [ ] Guest request to `/history` fails

## Logged-in Tests

- [ ] Login and copy JWT token
- [ ] `POST /analyze` with token returns `saved: true`
- [ ] `GET /history` returns saved items
- [ ] `GET /history/:id` returns one item
- [ ] `DELETE /history/:id` deletes one item
- [ ] Deleted item no longer appears in history
- [ ] Logged-in user cannot access another user's history item

---

# Current Backend Status

Completed:

- Backend foundation
- Neon database setup
- Prisma setup
- Full User CRUD API routes
- Backend auth setup
- EMAIL register/login with bcrypt
- JWT generation and verification
- Protected `/auth/me` route
- Logout route
- Google OAuth and Meta OAuth backend route structures
- Clean error handling
- `.env.example`
- Pronunciation module created
- Guest pronunciation analysis works
- Optional auth middleware added
- Logged-in pronunciation history routes added
- Input type support added
- Voice input placeholder added
- Rich pronunciation response structure added
- Prisma pronunciation history model added
- Pronunciation options endpoint added
- Pronunciation API documentation added

---

# Not Started Yet

- Frontend
- Real AI pronunciation generation
- Real voice/audio upload
- Speech-to-text
- Audio pronunciation scoring
- Favorites
- Progress tracking
- User personalization