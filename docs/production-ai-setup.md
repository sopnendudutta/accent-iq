# Production AI Setup

This checkpoint prepares AccentIQ production for Gemini text pronunciation analysis.

## Render Backend Variables

Open the AccentIQ backend service in Render, then add or update these environment variables:

```env
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<real Gemini key>
```

Do not commit the real Gemini key to the repository.

## Safe Fallback Behavior

The backend keeps V1 safe by falling back to the mock pronunciation engine when:

- `PRONUNCIATION_ENGINE` is `mock`
- `GEMINI_API_KEY` is missing
- Gemini returns an empty or invalid response
- Gemini response validation fails
- The Gemini request throws an error

## Manual Render Steps

1. Open the Render dashboard.
2. Open the AccentIQ backend service.
3. Go to Environment.
4. Add or update the variables listed above.
5. Save changes.
6. Redeploy the backend service.
7. After redeploy, test `GET /api/v1/health`.
8. Test `POST /api/v1/pronunciation/analyze` with text input.

## Test Request

```http
POST /api/v1/pronunciation/analyze
Content-Type: application/json
```

```json
{
  "text": "comfortable",
  "accent": "US",
  "inputType": "TEXT"
}
```

Expected response:

- `success` is `true`
- `data.pronunciation.phonetic` exists
- `data.pronunciation.syllables` exists
- `data.guidance.mouthTip` exists
- `data.guidance.tips` exists
- `data.practice.exampleSentence` exists

## Rollback

If production AI behaves unexpectedly, set:

```env
PRONUNCIATION_ENGINE=mock
```

Then redeploy the backend. This keeps the pronunciation endpoint available while AI configuration is corrected.
