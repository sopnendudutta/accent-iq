# Audio Privacy And Voice Scoring Plan

## Goal

Plan audio privacy and future voice scoring before AccentIQ adds any raw audio upload, recording, storage, or provider-based speech scoring.

Checkpoint 10 is documentation-only. It does not add audio upload, audio storage, real voice scoring, new database fields, or new provider calls.

## Current V3 Decision

AccentIQ V3 will not implement raw audio upload, raw audio storage, or real voice pronunciation scoring.

The current voice experience remains:

- Users type text manually, or
- Users use browser speech-to-text to fill the existing text box, then
- Users manually click Analyze, and
- AccentIQ analyzes the text/transcript, not raw audio.

This keeps the current product honest: AccentIQ gives pronunciation guidance from text and selected accent. It does not claim to measure the user's actual spoken accuracy.

## Required Privacy Questions

### 1. Will Raw Audio Be Uploaded?

No, not in V3.

AccentIQ will not send microphone audio files, recordings, or raw audio streams to the AccentIQ backend in V3.

Current browser speech-to-text may be handled by the user's browser or device speech recognition system, but AccentIQ itself only receives the resulting text transcript after the browser fills the text box.

### 2. Will Raw Audio Be Stored?

No.

AccentIQ V3 does not store raw audio, voice recordings, microphone streams, or audio-derived voiceprints.

Saved pronunciation history contains text-based practice results only, such as:

- practiced text
- selected accent
- phonetic guidance
- syllables
- tips
- timestamps

### 3. If Stored, Where?

Not applicable for V3 because raw audio is not stored.

If a future version adds audio storage, the storage location must be chosen and documented before implementation. A future-safe design would need:

- private object storage, not public buckets
- encryption at rest
- short-lived signed access URLs
- user ownership tied to account ID
- environment-specific storage buckets
- strict access logging
- deletion support

No such storage is implemented in V3.

### 4. If Stored, For How Long?

Not applicable for V3 because raw audio is not stored.

If a future version stores audio, retention must default to the shortest useful period. A safe future policy should choose one of these before implementation:

- immediate discard after scoring
- temporary processing-only retention, such as minutes or hours
- user-controlled saved clips with an explicit retention setting

AccentIQ should not silently keep voice recordings indefinitely.

### 5. Can The User Delete It?

In V3, there is no raw audio to delete.

If audio storage is added later, user deletion must be implemented before launch. Future deletion requirements:

- delete one recording
- delete all recordings for the account
- delete derived scoring records if tied to the recording
- delete storage objects and database references together
- show clear success or failure states
- include account deletion coverage

Until that exists, raw audio storage should remain out of scope.

### 6. Does Guest Mode Allow Audio?

Guest mode may continue to use browser speech-to-text because AccentIQ does not receive or store raw audio from that feature.

Guest mode should not allow future raw audio upload or saved audio recordings unless the product first solves:

- explicit guest consent
- anonymous deletion
- retention rules
- provider processing disclosure
- abuse controls
- clear explanation that audio may not be recoverable without an account

Recommended V3 rule:

Guest voice input is browser transcript only. Raw audio upload is disabled.

### 7. What Consent Message Is Shown?

Current V3 voice-to-text helper copy should stay simple and honest:

```txt
Use your browser's speech recognition to fill the text box. AccentIQ does not upload or save raw audio. Review the words, then click Analyze.
```

If future raw audio scoring is added, the app must show explicit consent before recording or uploading. Proposed future consent copy:

```txt
AccentIQ will upload this audio clip to process pronunciation feedback. Raw audio may be processed by our speech provider and retained according to the audio retention setting shown here. Do not record sensitive personal information. You can delete saved audio from your account settings.
```

Future consent must be shown before microphone recording or upload starts, not after.

### 8. Which Provider Processes Audio?

No AccentIQ audio scoring provider processes raw audio in V3.

Current AI pronunciation guidance uses text input and selected accent. Browser speech-to-text may rely on the user's browser, operating system, or browser vendor, but AccentIQ does not receive the raw audio.

If future voice scoring is implemented, the provider must be selected and documented before launch. The provider review should include:

- what audio is sent
- whether the provider stores audio
- whether the provider trains on audio
- data retention and deletion terms
- region and subprocessors
- security posture
- pricing and rate limits
- fallback behavior

Do not add provider-based audio scoring until these answers are documented.

### 9. What Are The Risks?

Raw audio is more sensitive than typed text. Future audio scoring introduces risks that V3 intentionally avoids:

- voice recordings can identify a person
- recordings may include background speech or private information
- users may not understand browser speech-to-text versus server audio upload
- provider retention terms may conflict with product promises
- storage misconfiguration could expose private clips
- deletion must remove both files and derived records
- scoring can be misunderstood as a clinical or native-speaker judgment
- accent feedback can feel judgmental if copy is not careful
- minors or shared devices may require stricter consent patterns
- production logs must not accidentally capture audio URLs or sensitive metadata

The biggest product risk is trust. AccentIQ should remain clear that V3 does not score a user's real voice.

### 10. What Is Explicitly Not Implemented Yet?

V3 does not implement:

- raw audio upload
- raw audio recording in AccentIQ
- server-side microphone streaming
- audio file storage
- audio retention settings
- saved voice clips
- audio deletion endpoints
- real pronunciation accuracy scores from voice
- weak-sound detection from voice
- speech disorder detection
- medical or therapeutic speech claims
- third-party speech scoring provider integration
- database tables for audio clips or voice scores

## Future Implementation Gates

Before any future audio scoring checkpoint starts, AccentIQ should have:

1. A written consent flow.
2. A chosen audio provider and provider privacy review.
3. A data retention policy.
4. A deletion design.
5. A database and storage design.
6. A security review for upload limits and access control.
7. A clear UI distinction between text guidance and voice scoring.
8. A fallback plan when audio scoring fails.
9. Updated Terms/Privacy copy if this becomes a public production feature.
10. Manual QA covering guest, logged-in, deletion, failed upload, and provider outage paths.

## Safe V3 Copy Rules

Allowed copy:

```txt
AccentIQ analyzes the text you provide.
Browser voice-to-text fills the text box.
AccentIQ does not upload or save raw audio.
Voice scoring is not implemented yet.
Recommendations are based on saved practice activity.
```

Avoid copy:

```txt
AccentIQ scored your voice.
We detected your weak sounds.
Your pronunciation accuracy is 92%.
Your speech is incorrect.
This diagnoses your accent or speech issue.
```

## Testing Checklist For This Checkpoint

Documentation checks:

- The plan answers all ten required privacy questions.
- The plan clearly says raw audio upload is not implemented in V3.
- The plan clearly says raw audio storage is not implemented in V3.
- The plan clearly says real voice scoring is not implemented in V3.
- The plan preserves browser speech-to-text as the current voice input behavior.
- The plan does not include secrets or provider credentials.
- No backend, Prisma, or frontend code is changed.

## Checkpoint 10 Outcome

Checkpoint 10 is complete when:

- `docs/audio-privacy-and-voice-scoring-plan.md` exists.
- V3's audio decision is documented.
- Future voice scoring is gated behind consent, storage, provider, retention, and deletion planning.
- The change is committed and pushed to `origin/dev`.
