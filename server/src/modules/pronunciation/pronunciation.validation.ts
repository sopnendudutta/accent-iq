import { z } from "zod";
import {
    PRONUNCIATION_ACCENTS,
    PRONUNCIATION_INPUT_TYPES,
    PRONUNCIATION_MAX_TEXT_LENGTH,
} from "./pronunciation.constants";

export const analyzePronunciationSchema = z.object({
    body: z
        .object({
            inputType: z
                .enum(PRONUNCIATION_INPUT_TYPES, {
                    message: "Input type must be TEXT or VOICE",
                })
                .default("TEXT"),

            text: z
                .string()
                .trim()
                .max(
                    PRONUNCIATION_MAX_TEXT_LENGTH,
                    `Text must be less than ${PRONUNCIATION_MAX_TEXT_LENGTH} characters`
                )
                .optional(),

            accent: z.enum(PRONUNCIATION_ACCENTS, {
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

export const pronunciationFavoriteIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Favorite id is required"),
    }),
});

export const favoritePronunciationSchema = z.object({
    body: z
        .object({
            inputType: z
                .enum(PRONUNCIATION_INPUT_TYPES, {
                    message: "Input type must be TEXT or VOICE",
                })
                .default("TEXT"),

            text: z
                .string()
                .trim()
                .min(1, "Text is required")
                .max(
                    PRONUNCIATION_MAX_TEXT_LENGTH,
                    `Text must be less than ${PRONUNCIATION_MAX_TEXT_LENGTH} characters`
                ),

            normalizedText: z.string().trim().optional(),

            accent: z.enum(PRONUNCIATION_ACCENTS, {
                message: "Accent must be US, UK, AUSTRALIAN, or INDIAN",
            }),

            pronunciation: z.object({
                phonetic: z.string().optional(),
                ipa: z.string().optional(),
                syllables: z.array(z.string()).optional(),
                stressPattern: z.string().optional(),
            }),

            guidance: z.object({
                mouthTip: z.string().optional(),
                commonMistake: z.string().optional(),
                tips: z.array(z.string()).optional(),
            }),

            practice: z.object({
                exampleSentence: z.string().optional(),
            }),
        })
        .transform((data) => ({
            ...data,
            normalizedText:
                data.normalizedText?.trim().toLowerCase() ||
                data.text.trim().toLowerCase(),
        })),
});

export type AnalyzePronunciationInput = z.infer<
    typeof analyzePronunciationSchema
>["body"];

export type FavoritePronunciationInput = z.infer<
    typeof favoritePronunciationSchema
>["body"];