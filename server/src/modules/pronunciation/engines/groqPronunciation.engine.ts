import { env } from "../../../config/env.js";
import { mockPronunciationEngine } from "./mockPronunciation.engine.js";
import { buildPronunciationPrompt } from "../prompts/pronunciationPrompt.js";
import { aiPronunciationResultSchema } from "../schemas/aiPronunciationResult.schema.js";
import type {
    PronunciationAnalysis,
    PronunciationEngineInput,
} from "../pronunciation.types.js";

export const groqPronunciationEngine = {
    analyze: async (
        input: PronunciationEngineInput
    ): Promise<PronunciationAnalysis> => {
        const prompt = buildPronunciationPrompt({
            text: input.text,
            accent: input.accent,
        });

        // This checkpoint only prepares the Groq engine structure.
        // We are not calling Groq API yet.
        // The prompt and schema imports are intentionally used here
        // so we know the future Groq engine wiring is build-safe.
        void prompt;
        void aiPronunciationResultSchema;
        void env.GROQ_MODEL;

        console.warn(
            "Groq engine placeholder reached. Groq API is not connected yet. Using mock fallback."
        );

        return mockPronunciationEngine.analyze(input);
    },
};