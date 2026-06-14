export const PRONUNCIATION_ACCENTS = [
    "US",
    "UK",
    "AUSTRALIAN",
    "INDIAN",
    "CANADIAN",
    "IRISH",
    "NEW_ZEALAND",
    "SOUTH_AFRICAN",
] as const;

export const PRONUNCIATION_INPUT_TYPES = ["TEXT", "VOICE"] as const;

export const PRONUNCIATION_MAX_TEXT_LENGTH = 200;

export const PRONUNCIATION_ACCENT_MESSAGE = `Accent must be one of: ${PRONUNCIATION_ACCENTS.join(
    ", "
)}`;

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
        {
            value: "CANADIAN",
            label: "Canadian English",
            exampleWord: "schedule",
            examplePronunciation: "SKEH-jool",
            enabled: true,
        },
        {
            value: "IRISH",
            label: "Irish English",
            exampleWord: "schedule",
            examplePronunciation: "SHED-yool",
            enabled: true,
        },
        {
            value: "NEW_ZEALAND",
            label: "New Zealand English",
            exampleWord: "schedule",
            examplePronunciation: "SHED-yool",
            enabled: true,
        },
        {
            value: "SOUTH_AFRICAN",
            label: "South African English",
            exampleWord: "schedule",
            examplePronunciation: "SHED-yool",
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
