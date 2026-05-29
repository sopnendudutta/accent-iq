import { z } from "zod";

export const analyzePronunciationSchema = z.object({
    body: z
        .object({
            inputType: z.enum(["TEXT", "VOICE"], {
                message: "Input type must be TEXT or VOICE",
            }).default("TEXT"),

            text: z
                .string()
                .trim()
                .max(200, "Text must be less than 200 characters")
                .optional(),

            accent: z.enum(["US", "UK", "AUSTRALIAN", "INDIAN"], {
                message: "Accent must be US, UK, AUSTRALIAN, or INDIAN",
            }),
        })
        .superRefine((data, ctx) => {
            if (data.inputType === "TEXT" && !data.text) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["text"],
                    message: "Text is required when inputType is TEXT",
                });
            }
        })
        .transform((data) => ({
            inputType: data.inputType,
            text: data.text ?? "",
            accent: data.accent,
        })),
});

export const pronunciationHistoryIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "History id is required"),
    }),
});

export type AnalyzePronunciationInput = z.infer<
    typeof analyzePronunciationSchema
>["body"];