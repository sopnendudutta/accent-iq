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
    name: string | null;
    email: string;
    imageUrl?: string | null;
    provider?: string;
    providerAccountId?: string | null;
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

export type MeResponse = {
    success: boolean;
    message: string;
    data:
    | AuthUser
    | {
        user: AuthUser;
    };
};

export type LogoutResponse = {
    success: boolean;
    message: string;
};