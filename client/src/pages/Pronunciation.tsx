import { useEffect, useState } from "react";
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
    PronunciationFavoriteItem,
    PronunciationFeatures,
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

type MessageType = "success" | "error" | "info";

const quickExamples = ["schedule", "comfortable", "water", "development"];

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

function Pronunciation() {
    const [accents, setAccents] = useState<AccentOption[]>([]);
    const [inputTypes, setInputTypes] = useState<InputTypeOption[]>([]);
    const [limits, setLimits] = useState<PronunciationLimits | null>(null);
    const [features, setFeatures] = useState<PronunciationFeatures | null>(null);

    const [selectedAccent, setSelectedAccent] = useState("");
    const [selectedInputType, setSelectedInputType] = useState("TEXT");
    const [text, setText] = useState("");

    const [status, setStatus] = useState("Loading pronunciation options...");
    const [statusType, setStatusType] = useState<MessageType>("info");

    const [formMessage, setFormMessage] = useState("");
    const [formMessageType, setFormMessageType] = useState<MessageType>("info");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<PronunciationAnalyzeResponse | null>(
        null
    );

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
            ? "★ Saved"
            : "☆ Save Favorite";

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

    async function loadPronunciationHistory() {
        const token = localStorage.getItem("accentiq_token");

        if (!token) {
            setHistory([]);
            setHistoryMessage("Login to save and view pronunciation history.");
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
                setFeatures(response.data.features);

                const savedPreferences = getUserPreferences();

                setUserPreferences(savedPreferences);

                setSelectedAccent(
                    getPreferredAccent(response.data.accents, savedPreferences)
                );

                setStatusType("success");
                setStatus("Pronunciation options loaded successfully.");
            } catch (error) {
                console.error(error);
                setStatusType("error");
                setStatus("Could not load pronunciation options.");
            }
        }

        loadPronunciationOptions();
        loadPronunciationHistory();
        loadPronunciationFavorites();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFormMessage("");
        setFavoriteActionMessage("");
        setHistoryActionMessage("");
        setResult(null);

        const cleanedText = text.trim();

        if (selectedInputType !== "TEXT") {
            setFormMessageType("error");
            setFormMessage("Voice input is planned but not enabled yet.");
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
            setFormMessage(response.message || "Pronunciation analyzed successfully.");

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

    return (
        <section className="page pronunciation-page">
            <div className="pronunciation-hero">
                <div>
                    <span className="home-eyebrow">Pronunciation practice</span>

                    <h1>Practice words with clear accent guidance.</h1>

                    <p>
                        Type a word or short sentence, choose an English accent, and get
                        readable pronunciation help, syllables, stress pattern, and practice
                        tips.
                    </p>
                </div>

                <div className="practice-status-row">
                    <div className="status-pill status-pill-success">Text input ready</div>
                    <div className="status-pill">Voice planned</div>
                    <div className="status-pill">History for users</div>
                </div>
            </div>

            <div className="pronunciation-layout">
                <div className="practice-main-column">
                    <div className="practice-form-card">
                        <div className="panel-header">
                            <div>
                                <span className="result-label">Analyze</span>
                                <h2>Try a word or sentence</h2>
                            </div>

                            <span className="accent-badge">{selectedAccentLabel}</span>
                        </div>

                        <form className="pronunciation-form" onSubmit={handleSubmit}>
                            <div className="form-grid-two">
                                <div className="form-field">
                                    <label htmlFor="inputType">Input Type</label>
                                    <select
                                        id="inputType"
                                        value={selectedInputType}
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
                                                {!inputType.enabled ? " - Coming soon" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="accent">Accent</label>
                                    <select
                                        id="accent"
                                        value={selectedAccent}
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
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder="Example: schedule"
                                    rows={4}
                                />
                            </div>

                            <div className="form-footer-row">
                                {limits && (
                                    <p className="character-count">
                                        {text.length}/{limits.maxTextLength} characters
                                    </p>
                                )}

                                <div className="quick-example-row">
                                    {quickExamples.map((example) => (
                                        <button
                                            key={example}
                                            type="button"
                                            className="example-chip"
                                            onClick={() => setText(example)}
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting || !selectedAccent}>
                                {isSubmitting ? "Analyzing..." : "Analyze Pronunciation"}
                            </button>
                        </form>

                        {formMessage && (
                            <div className={`inline-message inline-message-${formMessageType}`}>
                                <strong>Status:</strong>
                                <p>{formMessage}</p>
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="result-box polished-result-box">
                            <div className="result-section-title">
                                <span className="home-eyebrow">Result ready</span>
                                <h2>Pronunciation Result</h2>
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

                            <div className="result-grid">
                                <div className="result-card result-card-main">
                                    <span className="result-label">Readable pronunciation</span>
                                    <p className="big-pronunciation">
                                        {result.data.pronunciation.phonetic}
                                    </p>
                                </div>

                                <div className="result-card">
                                    <span className="result-label">IPA</span>
                                    <p>{result.data.pronunciation.ipa}</p>
                                </div>

                                <div className="result-card">
                                    <span className="result-label">Syllables</span>
                                    <p>{result.data.pronunciation.syllables.join(" • ")}</p>
                                </div>

                                <div className="result-card">
                                    <span className="result-label">Stress pattern</span>
                                    <p>{result.data.pronunciation.stressPattern}</p>
                                </div>
                            </div>

                            <div className="guidance-box">
                                <h3>Guidance</h3>

                                <p>
                                    <strong>Mouth tip:</strong> {result.data.guidance.mouthTip}
                                </p>

                                <p>
                                    <strong>Common mistake:</strong>{" "}
                                    {result.data.guidance.commonMistake}
                                </p>

                                {userPreferences.showTipsByDefault ? (
                                    <ul>
                                        {result.data.guidance.tips.map((tip) => (
                                            <li key={tip}>{tip}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="preference-hidden-note">
                                        Detailed tips are hidden by your Settings preference.
                                    </p>
                                )}
                            </div>

                            <div className="practice-box">
                                <h3>Practice</h3>

                                <p>
                                    <strong>Slow practice:</strong>{" "}
                                    {result.data.practice.slowPractice}
                                </p>

                                <p>
                                    <strong>Example sentence:</strong>{" "}
                                    {result.data.practice.exampleSentence}
                                </p>

                                <p>
                                    <strong>Repeat:</strong> {result.data.practice.repeatCount} times
                                </p>
                            </div>

                            <p className="save-note">
                                {result.data.saved
                                    ? "This result was saved to your history."
                                    : "Guest result only. Login later to save pronunciation history and favorites."}
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
                                    className="secondary-button"
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

                                        <div className="favorite-detail-grid">
                                            {item.ipa && (
                                                <div className="favorite-detail-mini">
                                                    <span>IPA</span>
                                                    <strong>{item.ipa}</strong>
                                                </div>
                                            )}

                                            {item.syllables && item.syllables.length > 0 && (
                                                <div className="favorite-detail-mini">
                                                    <span>Syllables</span>
                                                    <strong>{item.syllables.join(" • ")}</strong>
                                                </div>
                                            )}
                                        </div>

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
                                    className="secondary-button"
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

                        {!isHistoryLoading && history.length === 0 && (
                            <div className="empty-state-card">
                                <span className="empty-state-icon">📚</span>

                                <h3>
                                    {hasAuthToken
                                        ? "No history saved yet"
                                        : "Login to save pronunciation history"}
                                </h3>

                                <p>
                                    {hasAuthToken
                                        ? "Analyze a word while logged in and your practice result will appear here."
                                        : "Guest users can practice freely, but history is saved only after login."}
                                </p>
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
                                                        <strong>{item.syllables.join(" • ")}</strong>
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
                    <div className={`side-info-card side-info-card-${statusType}`}>
                        <span className="result-label">Options status</span>
                        <p>{status}</p>
                    </div>

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

                    {features && (
                        <div className="side-info-card">
                            <span className="result-label">V1 feature status</span>

                            <div className="feature-list">
                                <div className="feature-row">
                                    <span>Guest analysis</span>
                                    <strong>
                                        {features.guestAnalysis ? "Available" : "Coming soon"}
                                    </strong>
                                </div>

                                <div className="feature-row">
                                    <span>Logged-in history</span>
                                    <strong>
                                        {features.loggedInHistory ? "Available" : "Coming soon"}
                                    </strong>
                                </div>

                                <div className="feature-row">
                                    <span>Favorites</span>
                                    <strong>
                                        {features.favorites ? "Available" : "Coming soon"}
                                    </strong>
                                </div>

                                <div className="feature-row">
                                    <span>Voice input</span>
                                    <strong>
                                        {features.voiceInput ? "Available" : "Coming soon"}
                                    </strong>
                                </div>

                                <div className="feature-row">
                                    <span>Audio scoring</span>
                                    <strong>
                                        {features.audioScoring ? "Available" : "Coming soon"}
                                    </strong>
                                </div>

                                <div className="feature-row">
                                    <span>Progress tracking</span>
                                    <strong>
                                        {features.progressTracking ? "Available" : "Coming soon"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="side-info-card">
                        <span className="result-label">Available accents</span>

                        <div className="accent-list">
                            {accents.map((accent) => (
                                <div key={accent.value} className="compact-accent-card">
                                    <strong>{accent.label}</strong>
                                    <span>
                                        {accent.exampleWord} — {accent.examplePronunciation}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default Pronunciation;