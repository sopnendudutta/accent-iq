export const PRONUNCIATION_ACCENTS = [
    "US",
    "UK",
    "AUSTRALIAN",
    "INDIAN",
] as const;

export const PRONUNCIATION_INPUT_TYPES = ["TEXT", "VOICE"] as const;

export const PRONUNCIATION_MAX_TEXT_LENGTH = 200;

export type PronunciationAccentValue = (typeof PRONUNCIATION_ACCENTS)[number];

export type PronunciationInputTypeValue =
    (typeof PRONUNCIATION_INPUT_TYPES)[number];

export const PRONUNCIATION_OPTIONS = {
    accents: [
        {
            value: "US",
            label: "American English",
            exampleWord: "schedule",
            examplePronunciation: "SKEH-jool",
            enabled: true,
        },
        {
            value: "UK",
            label: "British English",
            exampleWord: "schedule",
            examplePronunciation: "SHED-yool",
            enabled: true,
        },
        {
            value: "AUSTRALIAN",
            label: "Australian English",
            exampleWord: "schedule",
            examplePronunciation: "SHED-yool",
            enabled: true,
        },
        {
            value: "INDIAN",
            label: "Indian English",
            exampleWord: "schedule",
            examplePronunciation: "SKEH-jool",
            enabled: true,
        },
    ],

    inputTypes: [
        {
            value: "TEXT",
            label: "Text input",
            enabled: true,
        },
        {
            value: "VOICE",
            label: "Voice input",
            enabled: false,
            message: "Voice input is planned but not enabled yet.",
        },
    ],

    limits: {
        maxTextLength: PRONUNCIATION_MAX_TEXT_LENGTH,
    },

    features: {
        guestAnalysis: true,
        loggedInHistory: true,
        voiceInput: false,
        audioScoring: false,
        favorites: false,
        progressTracking: false,
    },
} as const;