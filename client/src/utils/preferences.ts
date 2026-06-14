export type DefaultAccent =
    | "US"
    | "UK"
    | "AUSTRALIAN"
    | "INDIAN"
    | "CANADIAN"
    | "IRISH"
    | "NEW_ZEALAND"
    | "SOUTH_AFRICAN";

export type PracticeGoal = "CASUAL" | "REGULAR" | "INTENSIVE";

export type AccentIQUserPreferences = {
    defaultAccent: DefaultAccent;
    practiceGoal: PracticeGoal;
    showTipsByDefault: boolean;
    rememberLastAccent: boolean;
    lastUsedAccent: string | null;
};

const STORAGE_KEY = "accentiq_user_preferences";

export const DEFAULT_USER_PREFERENCES: AccentIQUserPreferences = {
    defaultAccent: "US",
    practiceGoal: "CASUAL",
    showTipsByDefault: true,
    rememberLastAccent: true,
    lastUsedAccent: null,
};

export const DEFAULT_ACCENT_OPTIONS: { value: DefaultAccent; label: string }[] = [
    { value: "US", label: "American English" },
    { value: "UK", label: "British English" },
    { value: "AUSTRALIAN", label: "Australian English" },
    { value: "INDIAN", label: "Indian English" },
    { value: "CANADIAN", label: "Canadian English" },
    { value: "IRISH", label: "Irish English" },
    { value: "NEW_ZEALAND", label: "New Zealand English" },
    { value: "SOUTH_AFRICAN", label: "South African English" },
];

export const PRACTICE_GOAL_OPTIONS: {
    value: PracticeGoal;
    label: string;
    description: string;
}[] = [
        {
            value: "CASUAL",
            label: "Casual",
            description: "A light practice mode for quick word checks.",
        },
        {
            value: "REGULAR",
            label: "Regular",
            description: "A steady practice mode for consistent learning.",
        },
        {
            value: "INTENSIVE",
            label: "Intensive",
            description: "A focused practice mode for deeper improvement.",
        },
    ];

function canUseLocalStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isDefaultAccent(value: unknown): value is DefaultAccent {
    return (
        value === "US" ||
        value === "UK" ||
        value === "AUSTRALIAN" ||
        value === "INDIAN" ||
        value === "CANADIAN" ||
        value === "IRISH" ||
        value === "NEW_ZEALAND" ||
        value === "SOUTH_AFRICAN"
    );
}

function isPracticeGoal(value: unknown): value is PracticeGoal {
    return value === "CASUAL" || value === "REGULAR" || value === "INTENSIVE";
}

export function getUserPreferences(): AccentIQUserPreferences {
    if (!canUseLocalStorage()) {
        return DEFAULT_USER_PREFERENCES;
    }

    try {
        const storedPreferences = window.localStorage.getItem(STORAGE_KEY);

        if (!storedPreferences) {
            return DEFAULT_USER_PREFERENCES;
        }

        const parsedPreferences = JSON.parse(
            storedPreferences
        ) as Partial<AccentIQUserPreferences>;

        return {
            defaultAccent: isDefaultAccent(parsedPreferences.defaultAccent)
                ? parsedPreferences.defaultAccent
                : DEFAULT_USER_PREFERENCES.defaultAccent,

            practiceGoal: isPracticeGoal(parsedPreferences.practiceGoal)
                ? parsedPreferences.practiceGoal
                : DEFAULT_USER_PREFERENCES.practiceGoal,

            showTipsByDefault:
                typeof parsedPreferences.showTipsByDefault === "boolean"
                    ? parsedPreferences.showTipsByDefault
                    : DEFAULT_USER_PREFERENCES.showTipsByDefault,

            rememberLastAccent:
                typeof parsedPreferences.rememberLastAccent === "boolean"
                    ? parsedPreferences.rememberLastAccent
                    : DEFAULT_USER_PREFERENCES.rememberLastAccent,

            lastUsedAccent:
                typeof parsedPreferences.lastUsedAccent === "string"
                    ? parsedPreferences.lastUsedAccent
                    : DEFAULT_USER_PREFERENCES.lastUsedAccent,
        };
    } catch (error) {
        console.error("Could not read AccentIQ preferences", error);
        return DEFAULT_USER_PREFERENCES;
    }
}

export function saveUserPreferences(preferences: AccentIQUserPreferences) {
    if (!canUseLocalStorage()) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function resetUserPreferences() {
    saveUserPreferences(DEFAULT_USER_PREFERENCES);
    return DEFAULT_USER_PREFERENCES;
}

export function saveLastUsedAccent(accent: string) {
    const currentPreferences = getUserPreferences();

    saveUserPreferences({
        ...currentPreferences,
        lastUsedAccent: accent,
    });
}
