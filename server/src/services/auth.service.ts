import bcrypt from "bcryptjs";
import { AuthProvider } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import {
    generateOAuthHandoffToken,
    generateOAuthStateToken,
    generateToken,
    verifyOAuthHandoffToken,
    verifyOAuthStateToken,
} from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

type RegisterInput = {
    name?: string;
    email: string;
    password: string;
};

type LoginInput = {
    email: string;
    password: string;
};

type GoogleOAuthConfig = {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
};

type GoogleTokenResponse = {
    access_token?: string;
    error?: string;
    error_description?: string;
};

type GoogleProfile = {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
};

const SALT_ROUNDS = 10;
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const removeSensitiveUserFields = (user: any) => {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
};

const getGoogleOAuthConfig = (): GoogleOAuthConfig | null => {
    if (
        !env.GOOGLE_CLIENT_ID ||
        !env.GOOGLE_CLIENT_SECRET ||
        !env.GOOGLE_CALLBACK_URL
    ) {
        return null;
    }

    return {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackUrl: env.GOOGLE_CALLBACK_URL,
    };
};

const requireGoogleOAuthConfig = (): GoogleOAuthConfig => {
    const config = getGoogleOAuthConfig();

    if (!config) {
        throw new AppError("Google OAuth is not configured", 503);
    }

    return config;
};

export const buildClientRedirectUrl = (
    path: string,
    query?: Record<string, string>,
    fragment?: Record<string, string>
) => {
    const clientBaseUrl = env.CLIENT_URL.replace(/\/$/, "");
    const url = new URL(path, `${clientBaseUrl}/`);

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    if (fragment) {
        url.hash = new URLSearchParams(fragment).toString();
    }

    return url.toString();
};

export const getGoogleAuthUrl = () => {
    const config = getGoogleOAuthConfig();

    if (!config) {
        return null;
    }

    const googleAuthUrl = new URL(GOOGLE_AUTH_URL);

    googleAuthUrl.searchParams.set("client_id", config.clientId);
    googleAuthUrl.searchParams.set("redirect_uri", config.callbackUrl);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    googleAuthUrl.searchParams.set(
        "state",
        generateOAuthStateToken({
            purpose: "google_oauth_state",
            nonce: randomUUID(),
        })
    );

    return googleAuthUrl.toString();
};

const exchangeGoogleCode = async (
    code: string,
    config: GoogleOAuthConfig
): Promise<string> => {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.callbackUrl,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
        throw new AppError(
            tokenData.error_description ||
            tokenData.error ||
            "Google OAuth token exchange failed",
            502
        );
    }

    return tokenData.access_token;
};

const getGoogleProfile = async (accessToken: string): Promise<GoogleProfile> => {
    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!profileResponse.ok) {
        throw new AppError("Could not fetch Google profile", 502);
    }

    return (await profileResponse.json()) as GoogleProfile;
};

const findOrCreateGoogleUser = async (profile: GoogleProfile) => {
    if (!profile.sub || !profile.email || !profile.email_verified) {
        throw new AppError("Google account email must be verified", 400);
    }

    const email = profile.email.trim().toLowerCase();

    const existingGoogleUser = await prisma.user.findUnique({
        where: {
            provider_providerAccountId: {
                provider: AuthProvider.GOOGLE,
                providerAccountId: profile.sub,
            },
        },
    });

    if (existingGoogleUser) {
        return prisma.user.update({
            where: {
                id: existingGoogleUser.id,
            },
            data: {
                name: existingGoogleUser.name || profile.name,
                imageUrl: profile.picture || existingGoogleUser.imageUrl,
            },
        });
    }

    const existingEmailUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingEmailUser) {
        throw new AppError(
            "This email already uses password login. Please login with email for now.",
            409
        );
    }

    return prisma.user.create({
        data: {
            name: profile.name,
            email,
            imageUrl: profile.picture,
            provider: AuthProvider.GOOGLE,
            providerAccountId: profile.sub,
        },
    });
};

export const register = async (input: RegisterInput) => {
    const email = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new AppError("User with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email,
            passwordHash,
            provider: AuthProvider.EMAIL,
        },
    });

    const token = generateToken({
        userId: user.id,
        email: user.email,
        provider: user.provider,
    });

    return {
        user: removeSensitiveUserFields(user),
        token,
    };
};

export const login = async (input: LoginInput) => {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            provider: true,
            providerAccountId: true,
            passwordHash: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user || user.provider !== AuthProvider.EMAIL || !user.passwordHash) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(
        input.password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({
        userId: user.id,
        email: user.email,
        provider: user.provider,
    });

    return {
        user: removeSensitiveUserFields(user),
        token,
    };
};

export const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            provider: true,
            providerAccountId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return removeSensitiveUserFields(user);
};

export const handleGoogleCallback = async (code: string, state: string) => {
    verifyOAuthStateToken(state);

    const config = requireGoogleOAuthConfig();
    const accessToken = await exchangeGoogleCode(code, config);
    const googleProfile = await getGoogleProfile(accessToken);
    const user = await findOrCreateGoogleUser(googleProfile);

    const handoffToken = generateOAuthHandoffToken({
        purpose: "google_oauth_handoff",
        userId: user.id,
        email: user.email,
        provider: "GOOGLE",
    });

    return {
        handoffToken,
    };
};

export const exchangeGoogleHandoffToken = async (handoffToken: string) => {
    const handoffPayload = verifyOAuthHandoffToken(handoffToken);

    const user = await prisma.user.findUnique({
        where: {
            id: handoffPayload.userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            provider: true,
            providerAccountId: true,
            passwordHash: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user || user.provider !== AuthProvider.GOOGLE) {
        throw new AppError("Google OAuth session could not be completed", 401);
    }

    const token = generateToken({
        userId: user.id,
        email: user.email,
        provider: user.provider,
    });

    return {
        user: removeSensitiveUserFields(user),
        token,
    };
};
