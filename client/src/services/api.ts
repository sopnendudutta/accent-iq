import type {
    PronunciationAnalyzeRequest,
    PronunciationAnalyzeResponse,
    PronunciationOptionsResponse,
} from "../types/pronunciation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function checkBackendHealth() {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);

    if (!response.ok) {
        throw new Error("Backend health check failed");
    }

    return response.json();
}

export async function getPronunciationOptions(): Promise<PronunciationOptionsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/pronunciation/options`);

    if (!response.ok) {
        throw new Error("Failed to fetch pronunciation options");
    }

    return response.json();
}

export async function analyzePronunciation(
    payload: PronunciationAnalyzeRequest
): Promise<PronunciationAnalyzeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/pronunciation/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to analyze pronunciation");
    }

    return data;
}