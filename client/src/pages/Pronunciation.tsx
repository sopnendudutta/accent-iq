import { useEffect, useState } from "react";
import {
    analyzePronunciation,
    getPronunciationHistory,
    getPronunciationOptions,
} from "../services/api";
import type {
    AccentOption,
    InputTypeOption,
    PronunciationAnalyzeResponse,
    PronunciationFeatures,
    PronunciationHistoryItem,
    PronunciationLimits,
} from "../types/pronunciation";

function Pronunciation() {
    const [accents, setAccents] = useState<AccentOption[]>([]);
    const [inputTypes, setInputTypes] = useState<InputTypeOption[]>([]);
    const [limits, setLimits] = useState<PronunciationLimits | null>(null);
    const [features, setFeatures] = useState<PronunciationFeatures | null>(null);

    const [selectedAccent, setSelectedAccent] = useState("");
    const [selectedInputType, setSelectedInputType] = useState("TEXT");
    const [text, setText] = useState("");

    const [status, setStatus] = useState("Loading pronunciation options...");
    const [formMessage, setFormMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<PronunciationAnalyzeResponse | null>(
        null
    );

    const [history, setHistory] = useState<PronunciationHistoryItem[]>([]);
    const [historyMessage, setHistoryMessage] = useState("");
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

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

                if (response.data.accents.length > 0) {
                    setSelectedAccent(response.data.accents[0].value);
                }

                setStatus("Pronunciation options loaded successfully");
            } catch (error) {
                console.error(error);
                setStatus("Could not load pronunciation options");
            }
        }

        loadPronunciationOptions();
        loadPronunciationHistory();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setFormMessage("");
        setResult(null);

        const cleanedText = text.trim();

        if (selectedInputType !== "TEXT") {
            setFormMessage("Voice input is planned but not enabled yet.");
            return;
        }

        if (!cleanedText) {
            setFormMessage("Please enter a word or sentence.");
            return;
        }

        if (limits && cleanedText.length > limits.maxTextLength) {
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
            setFormMessage(response.message || "Pronunciation analyzed successfully");

            if (response.data.saved) {
                await loadPronunciationHistory();
            }
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setFormMessage(error.message);
            } else {
                setFormMessage("Something went wrong while analyzing pronunciation.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="page">
            <h1>Pronunciation Practice</h1>

            <p>
                Type a word or sentence and choose an accent. Voice input is planned but
                not enabled yet.
            </p>

            <div className="status-box">
                <strong>Options status:</strong>
                <p>{status}</p>
            </div>

            <form className="pronunciation-form" onSubmit={handleSubmit}>
                <label htmlFor="inputType">Input Type</label>
                <select
                    id="inputType"
                    value={selectedInputType}
                    onChange={(event) => setSelectedInputType(event.target.value)}
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

                <label htmlFor="accent">Accent</label>
                <select
                    id="accent"
                    value={selectedAccent}
                    onChange={(event) => setSelectedAccent(event.target.value)}
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

                <label htmlFor="text">Word or sentence</label>
                <textarea
                    id="text"
                    value={text}
                    maxLength={limits?.maxTextLength}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Example: schedule"
                    rows={4}
                />

                {limits && (
                    <p className="character-count">
                        {text.length}/{limits.maxTextLength} characters
                    </p>
                )}

                <button type="submit" disabled={isSubmitting || !selectedAccent}>
                    {isSubmitting ? "Analyzing..." : "Analyze Pronunciation"}
                </button>
            </form>

            {formMessage && (
                <div className="info-box">
                    <strong>Result status:</strong>
                    <p>{formMessage}</p>
                </div>
            )}

            {result && (
                <div className="result-box">
                    <h2>Pronunciation Result</h2>

                    <div className="result-header">
                        <div>
                            <span className="result-label">Text</span>
                            <h3>{result.data.text}</h3>
                        </div>

                        <div className="accent-badge">{result.data.accent}</div>
                    </div>

                    <div className="result-grid">
                        <div className="result-card">
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

                        <ul>
                            {result.data.guidance.tips.map((tip) => (
                                <li key={tip}>{tip}</li>
                            ))}
                        </ul>
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
                            : "Guest result only. Login later to save pronunciation history."}
                    </p>
                </div>
            )}

            <div className="history-section">
                <div className="history-header">
                    <h2>Pronunciation History</h2>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={loadPronunciationHistory}
                        disabled={isHistoryLoading}
                    >
                        {isHistoryLoading ? "Loading..." : "Refresh History"}
                    </button>
                </div>

                {historyMessage && <p className="history-message">{historyMessage}</p>}

                {history.length > 0 && (
                    <div className="history-list">
                        {history.map((item) => (
                            <div key={item.id} className="history-card">
                                <div className="history-card-header">
                                    <div>
                                        <span className="result-label">Text</span>
                                        <h3>{item.text}</h3>
                                    </div>

                                    <div className="accent-badge">{item.accent}</div>
                                </div>

                                {item.phonetic && (
                                    <p>
                                        <strong>Pronunciation:</strong> {item.phonetic}
                                    </p>
                                )}

                                {item.syllables && item.syllables.length > 0 && (
                                    <p>
                                        <strong>Syllables:</strong> {item.syllables.join(" • ")}
                                    </p>
                                )}

                                {item.tips && item.tips.length > 0 && (
                                    <ul>
                                        {item.tips.map((tip) => (
                                            <li key={tip}>{tip}</li>
                                        ))}
                                    </ul>
                                )}

                                <p className="history-date">
                                    Saved on {formatDate(item.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {features && (
                <div className="info-box">
                    <strong>V1 feature status:</strong>
                    <p>
                        Guest analysis:{" "}
                        {features.guestAnalysis ? "Available" : "Not available"}
                    </p>
                    <p>Voice input: {features.voiceInput ? "Available" : "Coming soon"}</p>
                    <p>
                        Audio scoring: {features.audioScoring ? "Available" : "Coming soon"}
                    </p>
                    <p>
                        Progress tracking:{" "}
                        {features.progressTracking ? "Available" : "Coming soon"}
                    </p>
                </div>
            )}

            <div className="options-preview">
                <h2>Available Accents</h2>

                {accents.map((accent) => (
                    <div key={accent.value} className="accent-card">
                        <h3>{accent.label}</h3>
                        <p>
                            Example: {accent.exampleWord} — {accent.examplePronunciation}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Pronunciation;