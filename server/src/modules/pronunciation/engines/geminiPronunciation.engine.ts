import { GoogleGenAI } from "@google/genai";
import { env } from "../../../config/env.js";
import { mockPronunciationEngine } from "./mockPronunciation.engine.js";
import { buildPronunciationPrompt } from "../prompts/pronunciationPrompt.js";
import { aiPronunciationResultSchema } from "../schemas/aiPronunciationResult.schema.js";
import type {
    PronunciationAnalysis,
    PronunciationEngineInput,
} from "../pronunciation.types.js";

const geminiPronunciationResponseSchema = {
    type: "object",
    properties: {
        pronunciation: {
            type: "object",
            properties: {
                phonetic: {
                    type: "string",
                    description: "Simple readable pronunciation spelling.",
                },
                ipa: {
                    type: "string",
                    description: "IPA pronunciation for the selected accent.",
                },
                syllables: {
                    type: "array",
                    items: { type: "string" },
                    description: "Pronounceable syllable parts.",
                },
                stressPattern: {
                    type: "string",
                    description: "Short explanation of stress placement.",
                },
            },
            required: ["phonetic", "ipa", "syllables", "stressPattern"],
            additionalProperties: false,
        },
        guidance: {
            type: "object",
            properties: {
                mouthTip: {
                    type: "string",
                    description: "Beginner-friendly mouth/tongue/lip tip.",
                },
                commonMistake: {
                    type: "string",
                    description: "Polite common mistake warning.",
                },
                tips: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 4,
                    description: "Short practice tips.",
                },
            },
            required: ["mouthTip", "commonMistake", "tips"],
            additionalProperties: false,
        },
        practice: {
            type: "object",
            properties: {
                slowPractice: {
                    type: "string",
                    description: "Slow practice version with spacing.",
                },
                exampleSentence: {
                    type: "string",
                    description: "Short natural example sentence.",
                },
                repeatCount: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                    description: "How many times the learner should repeat.",
                },
            },
            required: ["slowPractice", "exampleSentence", "repeatCount"],
            additionalProperties: false,
        },
    },
    required: ["pronunciation", "guidance", "practice"],
    additionalProperties: false,
} as const;

const parseAiJson = (rawText: string): unknown => {
    const cleanedText = rawText
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

    const firstBraceIndex = cleanedText.indexOf("{");
    const lastBraceIndex = cleanedText.lastIndexOf("}");

    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
        console.warn("Raw Gemini response length:", cleanedText.length);
        console.warn("Raw Gemini response preview:", cleanedText.slice(0, 500));
        throw new Error("Gemini response did not contain JSON.");
    }

    const jsonText = cleanedText.slice(firstBraceIndex, lastBraceIndex + 1);

    return JSON.parse(jsonText);
};

export const geminiPronunciationEngine = {
    analyze: async (
        input: PronunciationEngineInput
    ): Promise<PronunciationAnalysis> => {
        if (!env.GEMINI_API_KEY) {
            console.warn(
                "GEMINI_API_KEY is missing. Using mock pronunciation fallback."
            );

            return mockPronunciationEngine.analyze(input);
        }

        try {
            const ai = new GoogleGenAI({
                apiKey: env.GEMINI_API_KEY,
            });

            const prompt = buildPronunciationPrompt({
                text: input.text,
                accent: input.accent,
            });

            const response = await ai.models.generateContent({
                model: env.GEMINI_MODEL,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: geminiPronunciationResponseSchema,
                    temperature: 0.2,
                    maxOutputTokens: 2000,
                },
            });

            const rawText = response.text?.trim();

            if (!rawText) {
                throw new Error("Gemini returned an empty response.");
            }

            const parsedJson = parseAiJson(rawText);
            const validatedResult =
                aiPronunciationResultSchema.safeParse(parsedJson);

            if (!validatedResult.success) {
                console.warn(
                    "Gemini response failed AccentIQ schema validation. Using mock fallback.",
                    validatedResult.error.flatten().fieldErrors
                );

                return mockPronunciationEngine.analyze(input);
            }

            const normalizedText = input.text.trim().toLowerCase();

            return {
                inputType: input.inputType,
                text: input.text,
                normalizedText,
                accent: input.accent,
                pronunciation: validatedResult.data.pronunciation,
                guidance: validatedResult.data.guidance,
                practice: validatedResult.data.practice,
            };
        } catch (error) {
            console.warn(
                "Gemini pronunciation engine failed. Using mock fallback.",
                error instanceof Error ? error.message : error
            );

            return mockPronunciationEngine.analyze(input);
        }
    },
};