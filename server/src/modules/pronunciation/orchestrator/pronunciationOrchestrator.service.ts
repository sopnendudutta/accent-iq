import { mockPronunciationEngine } from "../engines/mockPronunciation.engine.js";
import type {
    PronunciationAnalysis,
    PronunciationEngineInput,
} from "../pronunciation.types.js";

export const pronunciationOrchestratorService = {
    analyze: async (
        input: PronunciationEngineInput
    ): Promise<PronunciationAnalysis> => {
        // Future plan:
        // 1. Ask Gemini for a pronunciation result.
        // 2. Ask Groq for a pronunciation result.
        // 3. Validate both results.
        // 4. Compare accuracy, clarity, accent match, and beginner-friendliness.
        // 5. Return the best result.
        //
        // For now, this is only a safe placeholder.
        // No AI provider is called in this checkpoint.

        console.warn(
            "Auto/orchestrator mode selected, but orchestrator AI comparison is not connected yet. Using mock fallback."
        );

        return mockPronunciationEngine.analyze(input);
    },
};