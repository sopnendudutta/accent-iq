import { env } from "../../../config/env.js";
import { mockPronunciationEngine } from "./mockPronunciation.engine.js";
import { buildPronunciationPrompt } from "../prompts/pronunciationPrompt.js";
import { aiPronunciationResultSchema } from "../schemas/aiPronunciationResult.schema.js";
import type {
    PronunciationAnalysis,
    PronunciationEngineInput,
} from "../pronunciation.types.js";

export const geminiPronunciationEngine = {
    analyze: async (
        input: PronunciationEngineInput
    ): Promise<PronunciationAnalysis> => {
        const prompt = buildPronunciationPrompt({
            text: input.text,
            accent: input.accent,
        });

        // This checkpoint only prepares the Gemini engine structure.
        // We are not calling Gemini API yet.
        // The prompt and schema imports are intentionally used here
        // so we know the future Gemini engine wiring is build-safe.
        void prompt;
        void aiPronunciationResultSchema;
        void env.GEMINI_MODEL;

        console.warn(
            "Gemini engine placeholder reached. Gemini API is not connected yet. Using mock fallback."
        );

        return mockPronunciationEngine.analyze(input);
    },
};