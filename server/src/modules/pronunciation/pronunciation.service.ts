import { Accent, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AnalyzePronunciationInput } from "./pronunciation.validation";

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
};