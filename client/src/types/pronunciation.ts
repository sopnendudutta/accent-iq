export type AccentOption = {
    value: string;
    label: string;
    exampleWord?: string;
    examplePronunciation?: string;
    enabled: boolean;
};

export type InputTypeOption = {
    value: string;
    label: string;
    enabled: boolean;
    message?: string;
};

export type PronunciationLimits = {
    maxTextLength: number;
};

export type PronunciationFeatures = {
    guestAnalysis: boolean;
    loggedInHistory: boolean;
    voiceInput: boolean;
    audioScoring: boolean;
    favorites: boolean;
    progressTracking: boolean;
};

export type PronunciationOptions = {
    accents: AccentOption[];
    inputTypes: InputTypeOption[];
    limits: PronunciationLimits;
    features: PronunciationFeatures;
};

export type PronunciationOptionsResponse = {
    success: boolean;
    message: string;
    data: PronunciationOptions;
};

export type PronunciationAnalyzeRequest = {
    text: string;
    accent: string;
    inputType: string;
};

export type PronunciationResultData = {
    inputType: string;
    text: string;
    normalizedText: string;
    accent: string;
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
    saved: boolean;
};

export type PronunciationAnalyzeResponse = {
    success: boolean;
    message: string;
    data: PronunciationResultData;
};