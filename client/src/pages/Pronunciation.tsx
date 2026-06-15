import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
    addPronunciationFavorite,
    analyzePronunciation,
    clearPronunciationHistory,
    getPronunciationFavorites,
    getPronunciationHistory,
    getPronunciationOptions,
    removePronunciationFavorite,
    removePronunciationHistoryItem,
} from "../services/api";

import type {
    AccentOption,
    InputTypeOption,
    PronunciationAnalyzeResponse,
    PronunciationResultData,
    PronunciationFavoriteItem,
    PronunciationHistoryItem,
    PronunciationLimits,
} from "../types/pronunciation";

import {
    getUserPreferences,
    saveLastUsedAccent,
} from "../utils/preferences";

import type {
    AccentIQUserPreferences,
    PracticeGoal,
} from "../utils/preferences";
import type {
    BrowserSpeechRecognition,
    BrowserSpeechRecognitionStatus,
} from "../types/speech";

type MessageType = "success" | "error" | "info";

const aiCoachingSteps = [
    {
        label: "Reading the word",
        detail: "Checking the accent target and the natural sound pattern.",
    },
    {
        label: "Finding syllables",
        detail: "Breaking it into pronounceable parts before giving guidance.",
    },
    {
        label: "Preparing coaching",
        detail: "Turning the answer into a short practice lesson.",
    },
];

function getPreferredAccent(
    availableAccents: AccentOption[],
    preferences: AccentIQUserPreferences
) {
    const enabledAccents = availableAccents.filter((accent) => accent.enabled);
    const enabledAccentValues = enabledAccents.map((accent) => accent.value);

    if (enabledAccents.length === 0) {
        return "";
    }

    if (
        preferences.rememberLastAccent &&
        preferences.lastUsedAccent &&
        enabledAccentValues.includes(preferences.lastUsedAccent)
    ) {
        return preferences.lastUsedAccent;
    }

    if (enabledAccentValues.includes(preferences.defaultAccent)) {
        return preferences.defaultAccent;
    }

    if (enabledAccentValues.includes("US")) {
        return "US";
    }

    return enabledAccents[0].value;
}

function getPracticeGoalLabel(goal: PracticeGoal) {
    if (goal === "REGULAR") {
        return "Regular";
    }

    if (goal === "INTENSIVE") {
        return "Intensive";
    }

    return "Casual";
}

function getSpeechRecognitionLanguage(accent: string) {
    if (accent === "UK") {
        return "en-GB";
    }

    if (accent === "AUSTRALIAN") {
        return "en-AU";
    }

    if (accent === "INDIAN") {
        return "en-IN";
    }

    if (accent === "CANADIAN") {
        return "en-CA";
    }

    if (accent === "IRISH") {
        return "en-IE";
    }

    if (accent === "NEW_ZEALAND") {
        return "en-NZ";
    }

    if (accent === "SOUTH_AFRICAN") {
        return "en-ZA";
    }

    return "en-US";
}

function getBrowserSpeechRecognitionConstructor() {
    if (typeof window === "undefined") {
        return undefined;
    }

    return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function getResultFallbackNotice(data: PronunciationResultData) {
    const inputText = data.text.trim().toLowerCase();
    const accent = data.accent.trim().toLowerCase();
    const phonetic = data.pronunciation.phonetic.trim().toLowerCase();
    const ipa = data.pronunciation.ipa.trim().toLowerCase();
    const stressPattern = data.pronunciation.stressPattern.trim().toLowerCase();
    const genericPhonetic = `${inputText} pronunciation for ${accent}`;

    if (
        phonetic === genericPhonetic ||
        ipa === "ipa will be generated later" ||
        stressPattern === "stress pattern will be generated later"
    ) {
        return "AccentIQ returned a simplified fallback result for this word. You can still practice it, or try again for a fuller AI coaching response.";
    }

    return "";
}

function Pronunciation() {
    const [accents, setAccents] = useState<AccentOption[]>([]);
    const [inputTypes, setInputTypes] = useState<InputTypeOption[]>([]);
    const [limits, setLimits] = useState<PronunciationLimits | null>(null);

    const [selectedAccent, setSelectedAccent] = useState("");
    const [selectedInputType, setSelectedInputType] = useState("TEXT");
    const [text, setText] = useState("");

    const [isSpeechSupported, setIsSpeechSupported] = useState(() =>
        Boolean(getBrowserSpeechRecognitionConstructor())
    );

    const [voiceStatus, setVoiceStatus] =
        useState<BrowserSpeechRecognitionStatus>(() =>
            getBrowserSpeechRecognitionConstructor() ? "idle" : "unsupported"
        );

    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

    const [formMessage, setFormMessage] = useState("");
    const [formMessageType, setFormMessageType] = useState<MessageType>("info");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coachingStepIndex, setCoachingStepIndex] = useState(0);
    const [result, setResult] = useState<PronunciationAnalyzeResponse | null>(
        null
    );
    const resultRef = useRef<HTMLDivElement | null>(null);

    const [history, setHistory] = useState<PronunciationHistoryItem[]>([]);
    const [historyMessage, setHistoryMessage] = useState("");
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historySearchText, setHistorySearchText] = useState("");
    const [historyAccentFilter, setHistoryAccentFilter] = useState("ALL");
    const [historyActionMessage, setHistoryActionMessage] = useState("");
    const [historyActionType, setHistoryActionType] =
        useState<MessageType>("info");

    const [userPreferences, setUserPreferences] =
        useState<AccentIQUserPreferences>(() => getUserPreferences());

    const [favorites, setFavorites] = useState<PronunciationFavoriteItem[]>([]);
    const [favoritesMessage, setFavoritesMessage] = useState("");
    const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
    const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
    const [favoriteActionMessage, setFavoriteActionMessage] = useState("");
    const [favoriteActionType, setFavoriteActionType] =
        useState<MessageType>("info");

    const selectedAccentLabel =
        accents.find((accent) => accent.value === selectedAccent)?.label ||
        "Choose accent";

    const currentResultFavorite = result
        ? favorites.find(
            (favorite) =>
                favorite.normalizedText === result.data.normalizedText &&
                favorite.accent === result.data.accent
        )
        : undefined;

    const favoriteButtonLabel = isFavoriteSubmitting
        ? currentResultFavorite
            ? "Removing..."
            : "Saving..."
        : currentResultFavorite
            ? "Saved"
            : "Save favorite";

    const favoriteButtonTitle = currentResultFavorite
        ? "Remove this pronunciation from favorites"
        : "Save this pronunciation to favorites";

    const hasAuthToken = Boolean(localStorage.getItem("accentiq_token"));

    const favoriteCountLabel =
        favorites.length === 1
            ? "1 saved favorite"
            : `${favorites.length} saved favorites`;

    const historyCountLabel =
        history.length === 1 ? "1 saved item" : `${history.length} saved items`;

    const hasHistoryFilters =
        historySearchText.trim().length > 0 || historyAccentFilter !== "ALL";

    const historySearchQuery = historySearchText.trim().toLowerCase();

    const filteredHistory = history.filter((item) => {
        const matchesText =
            !historySearchQuery ||
            item.text.toLowerCase().includes(historySearchQuery) ||
            item.accent.toLowerCase().includes(historySearchQuery) ||
            Boolean(item.phonetic?.toLowerCase().includes(historySearchQuery));

        const matchesAccent =
            historyAccentFilter === "ALL" || item.accent === historyAccentFilter;

        return matchesText && matchesAccent;
    });

    const filteredHistoryCountLabel =
        filteredHistory.length === 1
            ? "1 matching item"
            : `${filteredHistory.length} matching items`;

    const activeCoachingStep =
        aiCoachingSteps[coachingStepIndex % aiCoachingSteps.length];

    const resultFallbackNotice = result
        ? getResultFallbackNotice(result.data)
        : "";

    const resultEyebrow = resultFallbackNotice
        ? "Simplified fallback"
        : "AI coach result";

    async function loadPronunciationHistory() {
        const token = localStorage.getItem("accentiq_token");

        if (!token) {
            setHistory([]);
            setHistoryMessage("");
            return;
        }

        try {
            setIsHistoryLoading(true);

            const response = await getPronunciationHistory();

            setHistory(response.data);
            setHistoryMessage(
                response.data.length > 0
                    ? "Pronunciation history loaded successfully."
                    : "No pronunciation history yet. Analyze a word to save your first item."
            );
        } catch (error) {
            console.error(error);
            setHistory([]);
            setHistoryMessage("Could not load pronunciation history.");
        } finally {
            setIsHistoryLoading(false);
        }
    }

    async function loadPronunciationFavorites() {
        const token = localStorage.getItem("accentiq_token");

        if (!token) {
            setFavorites([]);
            setFavoritesMessage("Login to save and view favorite pronunciations.");
            return;
        }

        try {
            setIsFavoritesLoading(true);

            const response = await getPronunciationFavorites();

            setFavorites(response.data);
            setFavoritesMessage(
                response.data.length > 0
                    ? "Favorite pronunciations loaded successfully."
                    : "No favorites yet. Save a pronunciation result to see it here."
            );
        } catch (error) {
            console.error(error);
            setFavorites([]);
            setFavoritesMessage("Could not load pronunciation favorites.");
        } finally {
            setIsFavoritesLoading(false);
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString();
    }

    useEffect(() => {
        async function loadPronunciationOptions() {
            try {
                const response = await getPronunciationOptions();

                setAccents(response.data.accents);
                setInputTypes(response.data.inputTypes);
                setLimits(response.data.limits);

                const savedPreferences = getUserPreferences();

                setUserPreferences(savedPreferences);

                setSelectedAccent(
                    getPreferredAccent(response.data.accents, savedPreferences)
                );
            } catch (error) {
                console.error(error);
            }
        }

        const accountDataLoadId = window.setTimeout(() => {
            void loadPronunciationHistory();
            void loadPronunciationFavorites();
        }, 0);

        void loadPronunciationOptions();

        return () => window.clearTimeout(accountDataLoadId);
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isSubmitting) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setCoachingStepIndex((currentIndex) =>
                (currentIndex + 1) % aiCoachingSteps.length
            );
        }, 1500);

        return () => window.clearInterval(intervalId);
    }, [isSubmitting]);

    useEffect(() => {
        if (!result || !resultRef.current) {
            return;
        }

        resultRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [result]);

    function handleStopVoiceInput() {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
        }

        setVoiceStatus("idle");
    }

    function handleStartVoiceInput() {
        if (typeof window === "undefined") {
            return;
        }

        const SpeechRecognitionConstructor = getBrowserSpeechRecognitionConstructor();

        if (!SpeechRecognitionConstructor) {
            setIsSpeechSupported(false);
            setVoiceStatus("unsupported");
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
        }

        const recognition = new SpeechRecognitionConstructor();

        recognition.lang = getSpeechRecognitionLanguage(selectedAccent);
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let didReceiveResult = false;
        let didHaveError = false;

        recognition.onstart = () => {
            setVoiceStatus("listening");
        };

        recognition.onresult = (event) => {
            didReceiveResult = true;

            if (event.results.length === 0 || event.results[0].length === 0) {
                setVoiceStatus("no-speech");
                return;
            }

            const transcript = event.results[0][0].transcript.trim();

            if (!transcript) {
                setVoiceStatus("no-speech");
                return;
            }

            setText(transcript);
            setVoiceStatus("transcript-ready");
        };

        recognition.onerror = (event) => {
            didHaveError = true;

            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                setVoiceStatus("permission-denied");
                return;
            }

            if (event.error === "no-speech") {
                setVoiceStatus("no-speech");
                return;
            }

            if (event.error === "aborted") {
                setVoiceStatus("idle");
                return;
            }

            if (event.error === "audio-capture") {
                setVoiceStatus("error");
                return;
            }

            if (event.error === "language-not-supported") {
                setVoiceStatus("error");
                return;
            }

            if (event.error === "network") {
                setVoiceStatus("error");
                return;
            }

            setVoiceStatus("error");
        };

        recognition.onend = () => {
            recognitionRef.current = null;

            if (!didReceiveResult && !didHaveError) {
                setVoiceStatus("idle");
            }
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (error) {
            console.error(error);
            recognitionRef.current = null;
            setVoiceStatus("error");
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFormMessage("");
        setFavoriteActionMessage("");
        setHistoryActionMessage("");
        setResult(null);

        const cleanedText = text.trim();

        if (selectedInputType !== "TEXT") {
            setFormMessageType("error");
            setFormMessage("Audio pronunciation scoring is not part of V1. Use Text mode or the Speak button to fill the text box.");
            return;
        }

        if (!cleanedText) {
            setFormMessageType("error");
            setFormMessage("Please enter a word or sentence.");
            return;
        }

        if (limits && cleanedText.length > limits.maxTextLength) {
            setFormMessageType("error");
            setFormMessage(`Text must be under ${limits.maxTextLength} characters.`);
            return;
        }

        try {
            setCoachingStepIndex(0);
            setIsSubmitting(true);

            const response = await analyzePronunciation({
                text: cleanedText,
                accent: selectedAccent,
                inputType: selectedInputType,
            });

            setResult(response);
            saveLastUsedAccent(selectedAccent);
            setUserPreferences(getUserPreferences());
            setFormMessageType("success");

            const fallbackNotice = getResultFallbackNotice(response.data);
            const aiSuccessMessage =
                "AI coach result is ready. Start with the phonetic spelling, then say the example sentence out loud.";
            const successMessage = fallbackNotice
                ? "Simplified result is ready. Try again if you want a fuller AI coaching answer."
                : response.message || aiSuccessMessage;

            setFormMessage(successMessage);

            if (response.data.saved) {
                await loadPronunciationHistory();
            }
        } catch (error) {
            console.error(error);
            setFormMessageType("error");

            if (error instanceof Error) {
                setFormMessage(error.message);
            } else {
                setFormMessage("Something went wrong while analyzing pronunciation.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleToggleResultFavorite() {
        const token = localStorage.getItem("accentiq_token");

        if (!token) {
            setFavoriteActionType("info");
            setFavoriteActionMessage(
                "Login to save this pronunciation to your favorites."
            );
            return;
        }

        if (!result) {
            return;
        }

        try {
            setIsFavoriteSubmitting(true);
            setFavoriteActionMessage("");

            if (currentResultFavorite) {
                await removePronunciationFavorite(currentResultFavorite.id);
                setFavoriteActionType("success");
                setFavoriteActionMessage(
                    "Removed from favorites. You can save it again anytime."
                );
            } else {
                await addPronunciationFavorite({
                    inputType: result.data.inputType,
                    text: result.data.text,
                    normalizedText: result.data.normalizedText,
                    accent: result.data.accent,
                    pronunciation: result.data.pronunciation,
                    guidance: result.data.guidance,
                    practice: result.data.practice,
                });

                setFavoriteActionType("success");
                setFavoriteActionMessage("Saved to favorites. You can revisit it below.");
            }

            await loadPronunciationFavorites();
        } catch (error) {
            console.error(error);
            setFavoriteActionType("error");

            if (error instanceof Error) {
                setFavoriteActionMessage(error.message);
            } else {
                setFavoriteActionMessage("Could not update favorite.");
            }
        } finally {
            setIsFavoriteSubmitting(false);
        }
    }

    async function handleRemoveFavorite(favoriteId: string) {
        try {
            setIsFavoritesLoading(true);
            setFavoriteActionMessage("");

            await removePronunciationFavorite(favoriteId);
            setFavoriteActionType("success");
            setFavoriteActionMessage("Favorite removed successfully.");

            await loadPronunciationFavorites();
        } catch (error) {
            console.error(error);
            setFavoriteActionType("error");

            if (error instanceof Error) {
                setFavoriteActionMessage(error.message);
            } else {
                setFavoriteActionMessage("Could not remove favorite.");
            }
        } finally {
            setIsFavoritesLoading(false);
        }
    }

    async function handleRemoveHistoryItem(historyId: string) {
        const shouldDelete = window.confirm(
            "Delete this pronunciation history item?"
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setIsHistoryLoading(true);
            setHistoryActionMessage("");

            await removePronunciationHistoryItem(historyId);

            setHistoryActionType("success");
            setHistoryActionMessage("History item deleted successfully.");

            await loadPronunciationHistory();
        } catch (error) {
            console.error(error);
            setHistoryActionType("error");

            if (error instanceof Error) {
                setHistoryActionMessage(error.message);
            } else {
                setHistoryActionMessage("Could not delete history item.");
            }
        } finally {
            setIsHistoryLoading(false);
        }
    }

    function handleResetHistoryFilters() {
        setHistorySearchText("");
        setHistoryAccentFilter("ALL");
    }

    async function handleClearHistory() {
        if (history.length === 0) {
            setHistoryActionType("info");
            setHistoryActionMessage("There is no history to clear.");
            return;
        }

        const shouldClear = window.confirm(
            "Clear all pronunciation history? This cannot be undone."
        );

        if (!shouldClear) {
            return;
        }

        try {
            setIsHistoryLoading(true);
            setHistoryActionMessage("");

            const response = await clearPronunciationHistory();

            setHistory([]);
            setHistorySearchText("");
            setHistoryAccentFilter("ALL");

            setHistoryMessage(
                "No pronunciation history yet. Analyze a word to save your first item."
            );
            setHistoryActionType("success");
            setHistoryActionMessage(
                `Cleared ${response.data.count} history item${response.data.count === 1 ? "" : "s"
                }.`
            );
        } catch (error) {
            console.error(error);
            setHistoryActionType("error");

            if (error instanceof Error) {
                setHistoryActionMessage(error.message);
            } else {
                setHistoryActionMessage("Could not clear pronunciation history.");
            }
        } finally {
            setIsHistoryLoading(false);
        }
    }

    const voiceHasIssue = [
        "unsupported",
        "permission-denied",
        "no-speech",
        "error",
    ].includes(voiceStatus);

    const voiceIsListening = voiceStatus === "listening";

    const voiceHelperClassName = [
        "voice-helper",
        voiceIsListening ? "voice-helper-listening" : "",
        voiceHasIssue ? "voice-helper-warning" : "",
    ]
        .filter(Boolean)
        .join(" ");

    const voiceButtonLabel = voiceIsListening ? "Stop listening" : "Start speaking";

    const voiceButtonTitle = voiceIsListening ? "Stop listening" : "Start speaking";

    const voiceButtonAriaLabel = voiceIsListening
        ? "Stop voice input"
        : "Start voice input";

    return (
        <section className="page pronunciation-page">
            <div className="pronunciation-hero">
                <div className="pronunciation-hero-content">
                    <h1>Practice a word, then read guidance like a coach is beside you.</h1>

                    <p>
                        Type or use browser voice-to-text, choose an accent, and get
                        simple pronunciation guidance without uploading raw audio.
                    </p>
                </div>

            </div>

            <div className="pronunciation-layout">
                <div className="practice-main-column">
                    <div className="practice-form-card">
                        <div className="panel-header">
                            <div>
                                <span className="result-label">Analyze</span>
                                <h2>Enter your word or sentence</h2>
                                <p className="panel-support-text">
                                    Choose the accent you want to practice, then type a short
                                    phrase or use the speak button to prepare a transcript.
                                </p>
                            </div>

                            <span className="accent-badge">{selectedAccentLabel}</span>
                        </div>

                        <form
                            className="pronunciation-form"
                            onSubmit={handleSubmit}
                            aria-busy={isSubmitting}
                        >
                            <div className="form-grid-two">
                                <div className="form-field">
                                    <label htmlFor="inputType">Analysis mode</label>
                                    <select
                                        id="inputType"
                                        value={selectedInputType}
                                        disabled={isSubmitting}
                                        onChange={(event) =>
                                            setSelectedInputType(event.target.value)
                                        }
                                    >
                                        {inputTypes.map((inputType) => (
                                            <option
                                                key={inputType.value}
                                                value={inputType.value}
                                                disabled={!inputType.enabled}
                                            >
                                                {inputType.label}
                                                {!inputType.enabled ? " - Audio scoring later" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="accent">Accent</label>
                                    <select
                                        id="accent"
                                        value={selectedAccent}
                                        disabled={isSubmitting}
                                        onChange={(event) =>
                                            setSelectedAccent(event.target.value)
                                        }
                                    >
                                        {accents.map((accent) => (
                                            <option
                                                key={accent.value}
                                                value={accent.value}
                                                disabled={!accent.enabled}
                                            >
                                                {accent.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="text">Word or sentence</label>
                                <textarea
                                    id="text"
                                    value={text}
                                    maxLength={limits?.maxTextLength}
                                    disabled={isSubmitting}
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder="Example: schedule"
                                    rows={4}
                                />
                            </div>

                            <div className={voiceHelperClassName}>
                                <div className="voice-helper-action-row">
                                    <button
                                        type="button"
                                        className={
                                            voiceIsListening
                                                ? "voice-helper-button voice-helper-button-listening"
                                                : "voice-helper-button"
                                        }
                                        onClick={
                                            voiceIsListening
                                                ? handleStopVoiceInput
                                                : handleStartVoiceInput
                                        }
                                        disabled={
                                            !isSpeechSupported ||
                                            voiceStatus === "unsupported" ||
                                            isSubmitting
                                        }
                                        aria-pressed={voiceIsListening}
                                        aria-label={voiceButtonAriaLabel}
                                        title={voiceButtonTitle}
                                    >
                                        {voiceButtonLabel}
                                    </button>
                                </div>
                            </div>

                            <div className="form-footer-row">
                                {limits && (
                                    <p className="character-count">
                                        {text.length}/{limits.maxTextLength} characters
                                    </p>
                                )}

                            </div>

                            <button type="submit" disabled={isSubmitting || !selectedAccent}>
                                {isSubmitting ? "Preparing coaching..." : "Analyze pronunciation"}
                            </button>
                        </form>

                        {isSubmitting && (
                            <div
                                className="ai-coach-status"
                                role="status"
                                aria-live="polite"
                            >
                                <div className="ai-coach-status-header">
                                    <span className="result-label">AI coach is working</span>
                                    <strong>{activeCoachingStep.label}</strong>
                                    <p>{activeCoachingStep.detail}</p>
                                </div>

                                <ol className="ai-coach-step-list">
                                    {aiCoachingSteps.map((step, index) => (
                                        <li
                                            key={step.label}
                                            className={
                                                index === coachingStepIndex
                                                    ? "ai-coach-step ai-coach-step-active"
                                                    : "ai-coach-step"
                                            }
                                            aria-current={
                                                index === coachingStepIndex ? "step" : undefined
                                            }
                                        >
                                            <span>{step.label}</span>
                                        </li>
                                    ))}
                                </ol>

                                <div className="ai-coach-progress" aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        {formMessage && (
                            <div className={`inline-message inline-message-${formMessageType}`}>
                                <strong>Status:</strong>
                                <p>{formMessage}</p>
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="result-box polished-result-box" ref={resultRef}>
                            <div className="result-section-title">
                                <div>
                                    <span className="result-label">{resultEyebrow}</span>
                                    <h2>Pronunciation result</h2>
                                    <p className="section-supporting-text">
                                        Start with the phonetic spelling, then practice the mouth
                                        guidance and example sentence out loud.
                                    </p>
                                </div>
                            </div>

                            <div className="result-header">
                                <div>
                                    <span className="result-label">Text</span>
                                    <h3>{result.data.text}</h3>
                                </div>

                                <div className="practice-status-row">
                                    <button
                                        type="button"
                                        className={`favorite-action-button ${currentResultFavorite ? "favorite-action-button-saved" : ""
                                            }`}
                                        onClick={handleToggleResultFavorite}
                                        disabled={isFavoriteSubmitting}
                                        aria-pressed={Boolean(currentResultFavorite)}
                                        title={favoriteButtonTitle}
                                    >
                                        {favoriteButtonLabel}
                                    </button>

                                    <div className="accent-badge">{result.data.accent}</div>
                                </div>
                            </div>

                            {favoriteActionMessage && (
                                <div
                                    className={`inline-message inline-message-${favoriteActionType}`}
                                >
                                    <strong>Favorites:</strong>
                                    <p>{favoriteActionMessage}</p>
                                </div>
                            )}

                            {resultFallbackNotice && (
                                <div className="inline-message inline-message-info result-source-note">
                                    <strong>Coach note:</strong>
                                    <p>{resultFallbackNotice}</p>
                                </div>
                            )}

                            <div className="result-grid">
                                <div className="result-card result-card-main">
                                    <span className="result-label">Phonetic spelling</span>
                                    <p className="big-pronunciation">
                                        {result.data.pronunciation.phonetic}
                                    </p>
                                </div>

                                <div className="result-card">
                                    <span className="result-label">Syllables</span>
                                    <p>{result.data.pronunciation.syllables.join(" / ")}</p>
                                </div>
                            </div>

                            <div className="guidance-box">
                                <h3>Mouth / tongue / lip guidance</h3>

                                <p>{result.data.guidance.mouthTip}</p>

                                <h3>Practice tips</h3>

                                <ul>
                                    {result.data.guidance.tips.map((tip) => (
                                        <li key={tip}>{tip}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="practice-box">
                                <h3>Example sentence</h3>

                                <p>{result.data.practice.exampleSentence}</p>
                            </div>

                            <p className="save-note">
                                {result.data.saved
                                    ? "This result was saved to your history."
                                    : "Guest result only."}
                            </p>
                        </div>
                    )}

                    <div className="history-section polished-history-section favorites-polish-section">
                        <div className="history-header favorites-section-header">
                            <div>
                                <span className="result-label">Saved favorites</span>
                                <h2>Favorite Pronunciations</h2>

                                <p className="section-supporting-text">
                                    Keep your most useful pronunciation results in one easy place.
                                </p>
                            </div>

                            <div className="section-header-actions">
                                <span className="section-count-pill">{favoriteCountLabel}</span>

                                <button
                                    type="button"
                                    className="secondary-button refresh-button"
                                    onClick={loadPronunciationFavorites}
                                    disabled={isFavoritesLoading}
                                >
                                    {isFavoritesLoading ? "Loading..." : "Refresh"}
                                </button>
                            </div>
                        </div>

                        {favoritesMessage && (
                            <p className="history-message">{favoritesMessage}</p>
                        )}

                        {!isFavoritesLoading && favorites.length === 0 && (
                            <div className="empty-state-card">
                                <span className="empty-state-icon">⭐</span>

                                <h3>
                                    {hasAuthToken
                                        ? "No favorites saved yet"
                                        : "Login to save favorites"}
                                </h3>

                                <p>
                                    {hasAuthToken
                                        ? "Analyze a pronunciation result, then click Save Favorite to keep it here."
                                        : "Guest users can analyze words, but favorites are saved only after login."}
                                </p>
                            </div>
                        )}

                        {favorites.length > 0 && (
                            <div className="favorites-grid">
                                {favorites.map((item) => (
                                    <div key={item.id} className="favorite-card">
                                        <div className="favorite-card-top">
                                            <div>
                                                <span className="result-label">Favorite word</span>
                                                <h3>{item.text}</h3>
                                            </div>

                                            <div className="accent-badge">{item.accent}</div>
                                        </div>

                                        {item.phonetic && (
                                            <p className="favorite-pronunciation">{item.phonetic}</p>
                                        )}

                                        {item.syllables && item.syllables.length > 0 && (
                                            <div className="favorite-detail-grid">
                                                <div className="favorite-detail-mini">
                                                    <span>Syllables</span>
                                                    <strong>{item.syllables.join(" / ")}</strong>
                                                </div>
                                            </div>
                                        )}

                                        {item.mouthTip && (
                                            <div className="favorite-tip-box">
                                                <span>Mouth tip</span>
                                                <p>{item.mouthTip}</p>
                                            </div>
                                        )}

                                        {item.exampleSentence && (
                                            <div className="favorite-tip-box favorite-example-box">
                                                <span>Example</span>
                                                <p>{item.exampleSentence}</p>
                                            </div>
                                        )}

                                        <div className="favorite-card-footer">
                                            <span>Favorited on {formatDate(item.createdAt)}</span>

                                            <button
                                                type="button"
                                                className="secondary-button danger-soft-button compact-danger-button"
                                                onClick={() => handleRemoveFavorite(item.id)}
                                                disabled={isFavoritesLoading}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="history-section polished-history-section history-polish-section">
                        <div className="history-header history-section-header">
                            <div>
                                <span className="result-label">Saved practice</span>
                                <h2>Pronunciation History</h2>

                                <p className="section-supporting-text">
                                    Review your saved practice results, search by word, or filter by
                                    accent.
                                </p>
                            </div>

                            <div className="section-header-actions">
                                <span className="section-count-pill">{historyCountLabel}</span>

                                <button
                                    type="button"
                                    className="secondary-button refresh-button"
                                    onClick={loadPronunciationHistory}
                                    disabled={isHistoryLoading}
                                >
                                    {isHistoryLoading ? "Loading..." : "Refresh"}
                                </button>

                                <button
                                    type="button"
                                    className="secondary-button danger-soft-button"
                                    onClick={handleClearHistory}
                                    disabled={isHistoryLoading || history.length === 0}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {historyMessage && <p className="history-message">{historyMessage}</p>}

                        {historyActionMessage && (
                            <div className={`inline-message inline-message-${historyActionType}`}>
                                <strong>History:</strong>
                                <p>{historyActionMessage}</p>
                            </div>
                        )}

                        {history.length > 0 && (
                            <div className="history-toolbar">
                                <div className="form-field">
                                    <label htmlFor="historySearch">Search history</label>

                                    <input
                                        id="historySearch"
                                        type="text"
                                        value={historySearchText}
                                        onChange={(event) =>
                                            setHistorySearchText(event.target.value)
                                        }
                                        placeholder="Search by word, accent, or pronunciation"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="historyAccentFilter">Filter by accent</label>

                                    <select
                                        id="historyAccentFilter"
                                        value={historyAccentFilter}
                                        onChange={(event) =>
                                            setHistoryAccentFilter(event.target.value)
                                        }
                                    >
                                        <option value="ALL">All accents</option>

                                        {accents.map((accent) => (
                                            <option key={accent.value} value={accent.value}>
                                                {accent.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="history-toolbar-summary">
                                    <span>{filteredHistoryCountLabel}</span>

                                    <button
                                        type="button"
                                        className="secondary-button compact-reset-button"
                                        onClick={handleResetHistoryFilters}
                                        disabled={!hasHistoryFilters}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}

                        {history.length > 0 && filteredHistory.length === 0 && (
                            <div className="empty-state-card">
                                <span className="empty-state-icon">🔍</span>

                                <h3>No matching history found</h3>

                                <p>
                                    Try another search term or reset your filters to view all saved
                                    practice results.
                                </p>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleResetHistoryFilters}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}

                        {filteredHistory.length > 0 && (
                            <div className="history-timeline-list">
                                {filteredHistory.map((item) => (
                                    <div key={item.id} className="history-timeline-card">
                                        <div className="history-timeline-marker" />

                                        <div className="history-card-content">
                                            <div className="history-card-header">
                                                <div>
                                                    <span className="result-label">Practice item</span>
                                                    <h3>{item.text}</h3>
                                                </div>

                                                <div className="history-card-actions">
                                                    <div className="accent-badge">{item.accent}</div>

                                                    <button
                                                        type="button"
                                                        className="secondary-button danger-soft-button compact-danger-button"
                                                        onClick={() => handleRemoveHistoryItem(item.id)}
                                                        disabled={isHistoryLoading}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="history-detail-grid">
                                                {item.phonetic && (
                                                    <div className="history-detail-mini history-detail-main">
                                                        <span>Pronunciation</span>
                                                        <strong>{item.phonetic}</strong>
                                                    </div>
                                                )}

                                                {item.syllables && item.syllables.length > 0 && (
                                                    <div className="history-detail-mini">
                                                        <span>Syllables</span>
                                                        <strong>{item.syllables.join(" / ")}</strong>
                                                    </div>
                                                )}
                                            </div>

                                            {item.tips &&
                                                item.tips.length > 0 &&
                                                userPreferences.showTipsByDefault && (
                                                    <div className="history-tip-box">
                                                        <span>Tips</span>

                                                        <ul>
                                                            {item.tips.map((tip) => (
                                                                <li key={tip}>{tip}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                            {item.tips &&
                                                item.tips.length > 0 &&
                                                !userPreferences.showTipsByDefault && (
                                                    <p className="preference-hidden-note">
                                                        Tips hidden by your Settings preference.
                                                    </p>
                                                )}

                                            <p className="history-date">
                                                Saved on {formatDate(item.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="practice-side-panel">
                    <div className="side-info-card">
                        <span className="result-label">Your preferences</span>

                        <div className="feature-list">
                            <div className="feature-row">
                                <span>Default accent</span>
                                <strong>{userPreferences.defaultAccent}</strong>
                            </div>

                            <div className="feature-row">
                                <span>Practice goal</span>
                                <strong>{getPracticeGoalLabel(userPreferences.practiceGoal)}</strong>
                            </div>

                            <div className="feature-row">
                                <span>Detailed tips</span>
                                <strong>
                                    {userPreferences.showTipsByDefault ? "Shown" : "Hidden"}
                                </strong>
                            </div>

                            <div className="feature-row">
                                <span>Last accent</span>
                                <strong>
                                    {userPreferences.rememberLastAccent
                                        ? userPreferences.lastUsedAccent || "Not used yet"
                                        : "Disabled"}
                                </strong>
                            </div>
                        </div>
                    </div>

                </aside>
            </div>
        </section>
    );
}

export default Pronunciation;
