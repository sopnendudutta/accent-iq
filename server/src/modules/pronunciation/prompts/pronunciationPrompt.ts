import type { Accent } from "@prisma/client";

type BuildPronunciationPromptInput = {
  text: string;
  accent: Accent;
};

const accentLabels: Record<Accent, string> = {
  US: "American English",
  UK: "British English",
  AUSTRALIAN: "Australian English",
  INDIAN: "Indian English",
};

export const buildPronunciationPrompt = ({
  text,
  accent,
}: BuildPronunciationPromptInput) => {
  const accentLabel = accentLabels[accent];

  return `
You are AccentIQ, a friendly English pronunciation coach.

Your task is to generate simple pronunciation guidance for a learner.

Input:
- Text: "${text}"
- Target accent: "${accentLabel}"

Return only valid JSON.
Do not include markdown.
Do not include explanations outside JSON.
Do not wrap the JSON in code fences.

The JSON must match this exact structure:

{
  "pronunciation": {
    "phonetic": "string",
    "ipa": "string",
    "syllables": ["string"],
    "stressPattern": "string"
  },
  "guidance": {
    "mouthTip": "string",
    "commonMistake": "string",
    "tips": ["string"]
  },
  "practice": {
    "slowPractice": "string",
    "exampleSentence": "string",
    "repeatCount": 3
  }
}

Main focus:
- phonetic spelling
- syllables
- mouth, tongue, and lip guidance
- practice tips
- example sentence

Rules:
- Keep everything beginner-friendly.
- Use simple English.
- The phonetic spelling should be readable for normal learners, not technical.
- The phonetic spelling should show how the word sounds in the selected accent.
- The syllables array should split the word or phrase into clear pronounceable parts.
- mouthTip must explain how to move the mouth, tongue, and lips.
- tips must contain 3 short, practical pronunciation tips.
- exampleSentence must be short, natural, and useful for practice.
- The IPA field is still required for compatibility, but keep it accurate and concise.
- The stressPattern field is still required for compatibility, but keep it short.
- The commonMistake field is still required for compatibility, but keep it short and polite.
- The slowPractice field is still required for compatibility, but keep it short.
- repeatCount must be a number between 1 and 5.
- Do not claim that you analyzed the user's real voice or audio.
- Do not diagnose speech disorders.
- Do not mention medical conditions.
- Do not shame the learner.
- Do not include user personal data.
- Do not include extra fields.
`.trim();
};