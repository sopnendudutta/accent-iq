import type { Accent, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import {
    AnalyzePronunciationInput,
    FavoritePronunciationInput,
} from "./pronunciation.validation.js";
import { PRONUNCIATION_OPTIONS } from "./pronunciation.constants.js";
import { pronunciationAiRouter } from "./ai/pronunciationAiRouter.js";
import { mockPronunciationEngine } from "./engines/mockPronunciation.engine.js";
import type {
    InputType,
    PronunciationResult,
} from "./pronunciation.types.js";

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

        const engineInput = {
            text,
            accent: accentValue,
            inputType: inputTypeValue,
        };

        const analysisResult =
            env.PRONUNCIATION_ENGINE === "ai"
                ? await pronunciationAiRouter.analyze(engineInput)
                : mockPronunciationEngine.analyze(engineInput);

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