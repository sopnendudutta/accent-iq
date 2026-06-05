import { z } from "zod";

export const aiPronunciationResultSchema = z.object({
    pronunciation: z.object({
        phonetic: z.string().trim().min(1),
        ipa: z.string().trim().min(1),
        syllables: z.array(z.string().trim().min(1)).min(1),
        stressPattern: z.string().trim().min(1),
    }),
    guidance: z.object({
        mouthTip: z.string().trim().min(1),
        commonMistake: z.string().trim().min(1),
        tips: z.array(z.string().trim().min(1)).min(1).max(5),
    }),
    practice: z.object({
        slowPractice: z.string().trim().min(1),
        exampleSentence: z.string().trim().min(1),
        repeatCount: z.number().int().min(1).max(5),
    }),
});

export type AiPronunciationResult = z.infer<
    typeof aiPronunciationResultSchema
>;