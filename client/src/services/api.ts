import type {
    AuthResponse,
    AuthUser,
    LoginRequest,
    LogoutResponse,
    MeResponse,
    RegisterRequest,
} from "../types/auth";

import type {
    ClearPronunciationHistoryResponse,
    PronunciationAnalyzeRequest,
    PronunciationAnalyzeResponse,
    PronunciationFavoriteRequest,
    PronunciationFavoriteResponse,
    PronunciationFavoritesResponse,
    PronunciationHistoryItemResponse,
    PronunciationHistoryResponse,
    PronunciationOptionsResponse,
} from "../types/pronunciation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getStoredToken() {
    return localStorage.getItem("accentiq_token");
}

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
    const token = getStoredToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/pronunciation/analyze`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to analyze pronunciation");
    }

    return data;
}

export async function getPronunciationHistory(): Promise<PronunciationHistoryResponse> {
    const token = getStoredToken();

    if (!token) {
        throw new Error("Login required to view pronunciation history");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/pronunciation/history`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pronunciation history");
    }

    return data;
}

export async function removePronunciationHistoryItem(
    historyId: string
): Promise<PronunciationHistoryItemResponse> {
    const token = getStoredToken();

    if (!token) {
        throw new Error("Login required to remove pronunciation history");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/v1/pronunciation/history/${historyId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to remove pronunciation history item");
    }

    return data;
}

export async function clearPronunciationHistory(): Promise<ClearPronunciationHistoryResponse> {
    const token = getStoredToken();

    if (!token) {
        throw new Error("Login required to clear pronunciation history");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/pronunciation/history`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to clear pronunciation history");
    }

    return data;
}

export async function getPronunciationFavorites(): Promise<PronunciationFavoritesResponse> {
    const token = getStoredToken();

    if (!token) {
        throw new Error("Login required to view pronunciation favorites");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/pronunciation/favorites`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pronunciation favorites");
    }

    return data;
}

export async function addPronunciationFavorite(
    payload: PronunciationFavoriteRequest
): Promise<PronunciationFavoriteResponse> {
    const token = getStoredToken();

    if (!token) {
        throw new Error("Login required to save pronunciation favorites");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/pronunciation/favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to save pronunciation favorite");
    }

    return data;
}

export async function removePronunciationFavorite(
    favoriteId: string
): Promise<PronunciationFavoriteResponse> {
    const token = getStoredToken();

    if (!token) {
        throw new Error("Login required to remove pronunciation favorites");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/v1/pronunciation/favorites/${favoriteId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to remove pronunciation favorite");
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

export function getGoogleOAuthStartUrl() {
    return `${API_BASE_URL}/api/v1/auth/google`;
}

export async function exchangeGoogleOAuthToken(
    handoffToken: string
): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/google/exchange`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ handoffToken }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Google login failed");
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
