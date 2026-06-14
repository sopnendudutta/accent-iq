# AccentIQ Pronunciation Backend Testing Checklist

This checklist confirms the backend pronunciation feature is working correctly before moving to the next major phase.

---

## Base URL

```txt
http://localhost:5000/api/v1/pronunciation
```

---

# 1. Options Route

## Test

```http
GET /api/v1/pronunciation/options
```

## Expected

- Works without login.
- Returns supported accents.
- Returns supported input types.
- Shows `TEXT` as enabled.
- Shows `VOICE` as disabled.
- Shows max text length as `200`.

Checklist:

- [ ] `GET /options` returns `success: true`
- [ ] `US` accent exists
- [ ] `UK` accent exists
- [ ] `AUSTRALIAN` accent exists
- [ ] `INDIAN` accent exists
- [ ] `CANADIAN` accent exists
- [ ] `IRISH` accent exists
- [ ] `NEW_ZEALAND` accent exists
- [ ] `SOUTH_AFRICAN` accent exists
- [ ] `TEXT` input type is enabled
- [ ] `VOICE` input type is disabled

---

# 2. Guest Analyze Route

## Test

```http
POST /api/v1/pronunciation/analyze
```

Body:

```json
{
  "text": "schedule",
  "accent": "US"
}
```

## Expected

- Works without login.
- `inputType` defaults to `TEXT`.
- `saved` is `false`.

Checklist:

- [ ] Old body format works
- [ ] Response has `inputType: "TEXT"`
- [ ] Response has `text: "schedule"`
- [ ] Response has `normalizedText: "schedule"`
- [ ] Response has `accent: "US"`
- [ ] Response has `saved: false`
- [ ] Response has `pronunciation`
- [ ] Response has `guidance`
- [ ] Response has `practice`

---

# 3. New TEXT Analyze Format

## Test

```http
POST /api/v1/pronunciation/analyze
```

Body:

```json
{
  "inputType": "TEXT",
  "text": "schedule",
  "accent": "UK"
}
```

## Expected

- Works without login.
- Returns UK pronunciation.

Checklist:

- [ ] New body format works
- [ ] Response has `inputType: "TEXT"`
- [ ] Response has `accent: "UK"`
- [ ] Response pronunciation has `phonetic: "SHED-yool"`
- [ ] Response pronunciation has `ipa: "/ˈʃedjuːl/"`
- [ ] Response has `saved: false`

---

# 4. Random Text Analyze

## Test

```http
POST /api/v1/pronunciation/analyze
```

Body:

```json
{
  "inputType": "TEXT",
  "text": "hello",
  "accent": "INDIAN"
}
```

## Expected

- Works with non-special/mock words.
- Returns placeholder pronunciation data.

Checklist:

- [ ] Random word works
- [ ] Response has `text: "hello"`
- [ ] Response has `normalizedText: "hello"`
- [ ] Response has `accent: "INDIAN"`
- [ ] Response has placeholder IPA
- [ ] Response has `saved: false`

---

# 5. Voice Input Placeholder

## Test

```http
POST /api/v1/pronunciation/analyze
```

Body:

```json
{
  "inputType": "VOICE",
  "text": "schedule",
  "accent": "US"
}
```

## Expected

Status:

```txt
501 Not Implemented
```

Checklist:

- [ ] Voice input returns `501`
- [ ] Response has `success: false`
- [ ] Response says voice input is planned but not enabled yet

---

# 6. Validation Tests

## Missing Text

Body:

```json
{
  "inputType": "TEXT",
  "accent": "US"
}
```

Expected:

- Validation error.
- Should not return success.

Checklist:

- [ ] Missing text fails

---

## Invalid Accent

Body:

```json
{
  "inputType": "TEXT",
  "text": "schedule",
  "accent": "SCOTTISH"
}
```

Expected:

- Validation error.
- Should not return success.

Checklist:

- [ ] Invalid accent fails

---

## Invalid Input Type

Body:

```json
{
  "inputType": "AUDIO",
  "text": "schedule",
  "accent": "US"
}
```

Expected:

- Validation error.
- Should not return success.

Checklist:

- [ ] Invalid input type fails

---

## Text Too Long

Body:

```json
{
  "inputType": "TEXT",
  "text": "paste more than 200 characters here",
  "accent": "US"
}
```

Expected:

- Validation error.
- Should not return success.

Checklist:

- [ ] Text over 200 characters fails

---

# 7. Logged-In Analyze Test

First login and copy JWT token.

Then test:

```http
POST /api/v1/pronunciation/analyze
```

Header:

```txt
Authorization: Bearer YOUR_TOKEN
```

Body:

```json
{
  "inputType": "TEXT",
  "text": "schedule",
  "accent": "US"
}
```

Expected:

- Works with token.
- Saves history.
- Returns `saved: true`.

Checklist:

- [ ] Logged-in analyze works
- [ ] Response has `saved: true`

---

# 8. History Routes

These require login.

## Get History

```http
GET /api/v1/pronunciation/history
```

Header:

```txt
Authorization: Bearer YOUR_TOKEN
```

Checklist:

- [ ] Logged-in user can fetch history
- [ ] Guest user cannot fetch history
- [ ] History only returns current user's records

---

## Get One History Item

```http
GET /api/v1/pronunciation/history/:id
```

Checklist:

- [ ] Logged-in user can fetch one own history item
- [ ] Invalid history id returns not found
- [ ] User cannot fetch another user's history item

---

## Delete One History Item

```http
DELETE /api/v1/pronunciation/history/:id
```

Checklist:

- [ ] Logged-in user can delete one own history item
- [ ] Deleted item no longer appears in history
- [ ] Invalid history id returns not found
- [ ] User cannot delete another user's history item

---

# Final Backend Status

Completed in Chat 7:

- [x] Pronunciation backend flow planned
- [x] Prisma pronunciation history model added
- [x] Optional auth middleware added
- [x] Guest pronunciation analysis added
- [x] Logged-in history saving added
- [x] History routes added
- [x] Rich pronunciation response structure added
- [x] Input type support added
- [x] Voice placeholder added
- [x] Pronunciation options endpoint added
- [x] Pronunciation constants centralized
- [x] Pronunciation API documentation added
- [x] Pronunciation testing checklist added

Not started yet:

- [ ] Frontend
- [ ] Real AI pronunciation generation
- [ ] Real voice/audio upload
- [ ] Speech-to-text
- [ ] Audio pronunciation scoring
- [ ] Favorites
- [ ] Progress tracking
- [ ] User personalization
