import { useEffect, useState } from "react";
import { getPronunciationOptions } from "../services/api";
import type {
    AccentOption,
    InputTypeOption,
} from "../types/pronunciation";

function Pronunciation() {
    const [accents, setAccents] = useState<AccentOption[]>([]);
    const [inputTypes, setInputTypes] = useState<InputTypeOption[]>([]);
    const [selectedAccent, setSelectedAccent] = useState("");
    const [selectedInputType, setSelectedInputType] = useState("TEXT");
    const [status, setStatus] = useState("Loading pronunciation options...");

    useEffect(() => {
        async function loadOptions() {
            try {
                const response = await getPronunciationOptions();

                setAccents(response.data.accents);
                setInputTypes(response.data.inputTypes);

                if (response.data.accents.length > 0) {
                    setSelectedAccent(response.data.accents[0].value);
                }

                setStatus("Pronunciation options loaded successfully");
            } catch (error) {
                console.error(error);
                setStatus("Could not load pronunciation options");
            }
        }

        loadOptions();
    }, []);

    return (
        <section className="page">
            <h1>Pronunciation Practice</h1>

            <p>
                Type a word or sentence and choose an accent. Voice input is planned but
                not active yet.
            </p>

            <div className="status-box">
                <strong>Options status:</strong>
                <p>{status}</p>
            </div>

            <form className="pronunciation-form">
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
            </form>

            <div className="options-preview">
                <h2>Available Accents</h2>

                {accents.map((accent) => (
                    <div key={accent.value} className="accent-card">
                        <h3>{accent.label}</h3>
                        <p>
                            Example: {accent.exampleWord} —{" "}
                            {accent.examplePronunciation}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Pronunciation;