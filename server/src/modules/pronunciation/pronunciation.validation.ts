import { z } from "zod";

export const analyzePronunciationSchema = z.object({
    body: z.object({
        text: z
            .string()
            .trim()
            .min(1, "Text is required")
            .max(200, "Text must be less than 200 characters"),

        accent: z.enum(["US", "UK", "AUSTRALIAN", "INDIAN"], {
            message: "Accent must be US, UK, AUSTRALIAN, or INDIAN",
        }),
    }),
});

export type AnalyzePronunciationInput = z.infer<
    typeof analyzePronunciationSchema
>["body"];