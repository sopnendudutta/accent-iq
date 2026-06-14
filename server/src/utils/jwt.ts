import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayloadData = {
    userId: string,
    email: string,
    provider: "GOOGLE" | "META" | "EMAIL";
};

export type OAuthHandoffPayloadData = {
    purpose: "google_oauth_handoff";
    userId: string;
    email: string;
    provider: "GOOGLE";
};

export type OAuthStatePayloadData = {
    purpose: "google_oauth_state";
    nonce: string;
};

export const generateToken = (payload: JwtPayloadData): string => {
    const options: SignOptions = {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayloadData => {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
        typeof decoded === "string" ||
        !decoded ||
        !("userId" in decoded) ||
        !("email" in decoded) ||
        !("provider" in decoded)
    ) {
        throw new Error("Invalid Token");
    }
    return {
        userId: decoded.userId as string,
        email: decoded.email as string,
        provider: decoded.provider as "GOOGLE" | "META" | "EMAIL",
    };
};

export const generateOAuthHandoffToken = (
    payload: OAuthHandoffPayloadData
): string => {
    const options: SignOptions = {
        expiresIn: "5m",
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyOAuthHandoffToken = (
    token: string
): OAuthHandoffPayloadData => {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
        typeof decoded === "string" ||
        !decoded ||
        decoded.purpose !== "google_oauth_handoff" ||
        !("userId" in decoded) ||
        !("email" in decoded) ||
        decoded.provider !== "GOOGLE"
    ) {
        throw new Error("Invalid OAuth handoff token");
    }

    return {
        purpose: "google_oauth_handoff",
        userId: decoded.userId as string,
        email: decoded.email as string,
        provider: "GOOGLE",
    };
};

export const generateOAuthStateToken = (
    payload: OAuthStatePayloadData
): string => {
    const options: SignOptions = {
        expiresIn: "10m",
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyOAuthStateToken = (token: string): OAuthStatePayloadData => {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
        typeof decoded === "string" ||
        !decoded ||
        decoded.purpose !== "google_oauth_state" ||
        !("nonce" in decoded)
    ) {
        throw new Error("Invalid OAuth state token");
    }

    return {
        purpose: "google_oauth_state",
        nonce: decoded.nonce as string,
    };
};

