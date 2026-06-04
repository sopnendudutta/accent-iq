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

export type PronunciationHistoryItem = {
    id: string;
    text: string;
    accent: string;
    phonetic?: string | null;
    syllables?: string[] | null;
    tips?: string[] | null;
    userId?: string | null;
    createdAt: string;
};

export type PronunciationHistoryResponse = {
    success: boolean;
    message: string;
    data: PronunciationHistoryItem[];
};
export type PronunciationHistoryItemResponse = {
    success: boolean;
    message: string;
    data: PronunciationHistoryItem;
};

export type ClearPronunciationHistoryResponse = {
    success: boolean;
    message: string;
    data: {
        count: number;
    };
};

export type PronunciationFavoriteRequest = Omit<
    PronunciationResultData,
    "saved"
>;

export type PronunciationFavoriteItem = {
    id: string;
    inputType: string;
    text: string;
    normalizedText: string;
    accent: string;

    phonetic?: string | null;
    ipa?: string | null;
    syllables?: string[] | null;
    stressPattern?: string | null;

    mouthTip?: string | null;
    commonMistake?: string | null;
    tips?: string[] | null;

    exampleSentence?: string | null;
    result?: PronunciationFavoriteRequest | null;

    userId: string;
    createdAt: string;
    updatedAt: string;
};

export type PronunciationFavoritesResponse = {
    success: boolean;
    message: string;
    data: PronunciationFavoriteItem[];
};

export type PronunciationFavoriteResponse = {
    success: boolean;
    message: string;
    data: PronunciationFavoriteItem;
};