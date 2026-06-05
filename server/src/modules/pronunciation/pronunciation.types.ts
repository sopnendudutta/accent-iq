import type { Accent } from "@prisma/client";

export type InputType = "TEXT" | "VOICE";

export type PronunciationAnalysis = {
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

export type PronunciationResult = PronunciationAnalysis & {
    saved: boolean;
};

export type PronunciationEngineInput = {
    text: string;
    accent: Accent;
    inputType: InputType;
};