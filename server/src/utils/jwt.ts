import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayloadData = {
    userId: string,
    email: string,
    provider: "GOOGLE" | "META" | "EMAIL";
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

