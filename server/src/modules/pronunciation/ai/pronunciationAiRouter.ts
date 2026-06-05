import { env } from "../../../config/env.js";
import { geminiPronunciationEngine } from "../engines/geminiPronunciation.engine.js";
import { groqPronunciationEngine } from "../engines/groqPronunciation.engine.js";
import { mockPronunciationEngine } from "../engines/mockPronunciation.engine.js";
import { pronunciationOrchestratorService } from "../orchestrator/pronunciationOrchestrator.service.js";
import type {
    PronunciationAnalysis,
    PronunciationEngineInput,
} from "../pronunciation.types.js";

export const pronunciationAiRouter = {
    analyze: async (
        input: PronunciationEngineInput
    ): Promise<PronunciationAnalysis> => {
        switch (env.AI_PROVIDER) {
            case "gemini": {
                return geminiPronunciationEngine.analyze(input);
            }

            case "groq": {
                return groqPronunciationEngine.analyze(input);
            }

            case "auto": {
                return pronunciationOrchestratorService.analyze(input);
            }

            default: {
                return mockPronunciationEngine.analyze(input);
            }
        }
    },
};