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