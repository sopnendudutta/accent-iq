import { Accent } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AnalyzePronunciationInput } from "./pronunciation.validation";

type PronunciationResult = {
    text: string;
    accent: Accent;
    phonetic: string;
    syllables: string[];
    tips: string[];
    saved: boolean;
};

const mockPronunciationData = (text: string, accent: Accent) => {
    return {
        phonetic: `${text} pronunciation for ${accent}`,
        syllables: text.split(/[\s-]+/),
        tips: [
            `Practice saying "${text}" slowly first.`,
            `Focus on clear mouth movement for ${accent} pronunciation.`,
            "Repeat the word multiple times and compare your sound.",
        ],
    };
};

export const pronunciationService = {
    analyzePronunciation: async (
        payload: AnalyzePronunciationInput,
        userId?: string
    ): Promise<PronunciationResult> => {
        const { text, accent } = payload;

        const accentValue = accent as Accent;
        const result = mockPronunciationData(text, accentValue);

        let saved = false;

        if (userId) {
            await prisma.pronunciationHistory.create({
                data: {
                    text,
                    accent: accentValue,
                    phonetic: result.phonetic,
                    syllables: result.syllables,
                    tips: result.tips,
                    userId,
                },
            });

            saved = true;
        }

        return {
            text,
            accent: accentValue,
            phonetic: result.phonetic,
            syllables: result.syllables,
            tips: result.tips,
            saved,
        };
    },

    getHistory: async (userId: string) => {
        return prisma.pronunciationHistory.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    getHistoryById: async (historyId: string, userId: string) => {
        return prisma.pronunciationHistory.findFirst({
            where: {
                id: historyId,
                userId,
            },
        });
    },

    deleteHistoryById: async (historyId: string, userId: string) => {
        const historyItem = await prisma.pronunciationHistory.findFirst({
            where: {
                id: historyId,
                userId,
            },
        });

        if (!historyItem) {
            return null;
        }

        await prisma.pronunciationHistory.delete({
            where: {
                id: historyId,
            },
        });

        return historyItem;
    },
};