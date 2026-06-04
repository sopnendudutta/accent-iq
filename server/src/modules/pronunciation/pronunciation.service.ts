import { Accent, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import {
    AnalyzePronunciationInput,
    FavoritePronunciationInput,
} from "./pronunciation.validation";
import { PRONUNCIATION_OPTIONS } from "./pronunciation.constants";

type InputType = "TEXT" | "VOICE";

type PronunciationAnalysis = {
    inputType: InputType;
    text: string;
    normalizedText: string;
    accent: Accent;
    pronunciation: {
        phonetic: string;
        ipa: string;
        syllables: string[];
        stressPattern: string;
    };
    guidance: {
        mouthTip: string;
        commonMistake: string;
        tips: string[];
    };
    practice: {
        slowPractice: string;
        exampleSentence: string;
        repeatCount: number;
    };
};

type PronunciationResult = PronunciationAnalysis & {
    saved: boolean;
};

const getMockPronunciationData = (
    text: string,
    accent: Accent,
    inputType: InputType
): PronunciationAnalysis => {
    const normalizedText = text.trim().toLowerCase();

    if (normalizedText === "schedule") {
        const accentMap: Record<
            Accent,
            {
                phonetic: string;
                ipa: string;
                syllables: string[];
                stressPattern: string;
                mouthTip: string;
            }
        > = {
            US: {
                phonetic: "SKEH-jool",
                ipa: "/ˈskedʒuːl/",
                syllables: ["SKEH", "jool"],
                stressPattern: "First syllable stress",
                mouthTip: "Start with a clear SK sound.",
            },
            UK: {
                phonetic: "SHED-yool",
                ipa: "/ˈʃedjuːl/",
                syllables: ["SHED", "yool"],
                stressPattern: "First syllable stress",
                mouthTip: "Start with a soft SH sound.",
            },
            AUSTRALIAN: {
                phonetic: "SHED-yool",
                ipa: "/ˈʃedjuːl/",
                syllables: ["SHED", "yool"],
                stressPattern: "First syllable stress",
                mouthTip: "Use a relaxed SH sound at the beginning.",
            },
            INDIAN: {
                phonetic: "SKEH-jool",
                ipa: "/ˈskedʒuːl/",
                syllables: ["SKEH", "jool"],
                stressPattern: "First syllable stress",
                mouthTip: "Keep the first syllable clear and avoid rushing the ending.",
            },
        };

        const selected = accentMap[accent];

        return {
            inputType,
            text,
            normalizedText,
            accent,
            pronunciation: {
                phonetic: selected.phonetic,
                ipa: selected.ipa,
                syllables: selected.syllables,
                stressPattern: selected.stressPattern,
            },
            guidance: {
                mouthTip: selected.mouthTip,
                commonMistake: "Avoid saying the word too flat or too fast.",
                tips: [
                    "Say the first syllable clearly.",
                    "Pause slightly between syllables while practicing.",
                    "Repeat slowly first, then increase your speed naturally.",
                ],
            },
            practice: {
                slowPractice: selected.syllables.join(" ... "),
                exampleSentence: "I need to check my schedule.",
                repeatCount: 5,
            },
        };
    }

    const syllables = normalizedText.split(/[\s-]+/).filter(Boolean);

    return {
        inputType,
        text,
        normalizedText,
        accent,
        pronunciation: {
            phonetic: `${text} pronunciation for ${accent}`,
            ipa: "IPA will be generated later",
            syllables,
            stressPattern: "Stress pattern will be generated later",
        },
        guidance: {
            mouthTip: `Focus on clear mouth movement for ${accent} pronunciation.`,
            commonMistake: "Avoid rushing the word.",
            tips: [
                `Practice saying "${text}" slowly first.`,
                `Focus on clarity for ${accent} pronunciation.`,
                "Repeat the word multiple times and compare your sound.",
            ],
        },
        practice: {
            slowPractice: syllables.join(" ... "),
            exampleSentence: `Practice using "${text}" in a simple sentence.`,
            repeatCount: 5,
        },
    };
};

export const pronunciationService = {
    getOptions: async () => {
        return PRONUNCIATION_OPTIONS;
    },

    analyzePronunciation: async (
        payload: AnalyzePronunciationInput,
        userId?: string
    ): Promise<PronunciationResult> => {
        const { text, accent, inputType } = payload;

        const accentValue = accent as Accent;
        const inputTypeValue = inputType as InputType;

        const analysisResult = getMockPronunciationData(
            text,
            accentValue,
            inputTypeValue
        );

        let saved = false;

        if (userId) {
            await prisma.pronunciationHistory.create({
                data: {
                    inputType: inputTypeValue,
                    text,
                    accent: accentValue,
                    phonetic: analysisResult.pronunciation.phonetic,
                    syllables: analysisResult.pronunciation.syllables,
                    tips: analysisResult.guidance.tips,
                    result: analysisResult as Prisma.InputJsonValue,
                    userId,
                },
            });

            saved = true;
        }

        return {
            ...analysisResult,
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

    clearHistory: async (userId: string) => {
        const deletedHistory = await prisma.pronunciationHistory.deleteMany({
            where: {
                userId,
            },
        });

        return deletedHistory;
    },

    addFavorite: async (
        payload: FavoritePronunciationInput,
        userId: string
    ) => {
        const accentValue = payload.accent as Accent;
        const inputTypeValue = payload.inputType as InputType;

        const resultForStorage = {
            inputType: inputTypeValue,
            text: payload.text,
            normalizedText: payload.normalizedText,
            accent: accentValue,
            pronunciation: payload.pronunciation,
            guidance: payload.guidance,
            practice: payload.practice,
        };

        return prisma.pronunciationFavorite.upsert({
            where: {
                userId_normalizedText_accent: {
                    userId,
                    normalizedText: payload.normalizedText,
                    accent: accentValue,
                },
            },
            update: {
                inputType: inputTypeValue,
                text: payload.text,
                phonetic: payload.pronunciation.phonetic,
                ipa: payload.pronunciation.ipa,
                syllables: payload.pronunciation.syllables,
                stressPattern: payload.pronunciation.stressPattern,
                mouthTip: payload.guidance.mouthTip,
                commonMistake: payload.guidance.commonMistake,
                tips: payload.guidance.tips,
                exampleSentence: payload.practice.exampleSentence,
                result: resultForStorage as Prisma.InputJsonValue,
            },
            create: {
                inputType: inputTypeValue,
                text: payload.text,
                normalizedText: payload.normalizedText,
                accent: accentValue,
                phonetic: payload.pronunciation.phonetic,
                ipa: payload.pronunciation.ipa,
                syllables: payload.pronunciation.syllables,
                stressPattern: payload.pronunciation.stressPattern,
                mouthTip: payload.guidance.mouthTip,
                commonMistake: payload.guidance.commonMistake,
                tips: payload.guidance.tips,
                exampleSentence: payload.practice.exampleSentence,
                result: resultForStorage as Prisma.InputJsonValue,
                userId,
            },
        });
    },

    getFavorites: async (userId: string) => {
        return prisma.pronunciationFavorite.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    deleteFavoriteById: async (favoriteId: string, userId: string) => {
        const favoriteItem = await prisma.pronunciationFavorite.findFirst({
            where: {
                id: favoriteId,
                userId,
            },
        });

        if (!favoriteItem) {
            return null;
        }

        await prisma.pronunciationFavorite.delete({
            where: {
                id: favoriteId,
            },
        });

        return favoriteItem;
    },
};