export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    imageUrl?: string | null;
    provider?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type AuthResponse = {
    success: boolean;
    message: string;
    data?: {
        user?: AuthUser;
        token?: string;
        accessToken?: string;
    };
};