import type {
    AuthResponse,
    AuthUser,
    LoginRequest,
    LogoutResponse,
    MeResponse,
    RegisterRequest,
} from "../types/auth";

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

export async function registerUser(
    payload: RegisterRequest
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
}

export async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    const data: MeResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch current user");
    }

    if ("user" in data.data) {
        return data.data.user;
    }

    return data.data;
}

export async function logoutUser(token: string): Promise<LogoutResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Logout failed");
    }

    return data;
}