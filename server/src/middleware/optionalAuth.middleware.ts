import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export type AuthenticatedUser = {
    userId: string;
    email: string;
    provider: string;
};

export interface OptionalAuthRequest extends Request {
    user?: AuthenticatedUser;
}

export const optionalAuth = (
    req: OptionalAuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return next();
        }

        const decoded = verifyToken(token);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            provider: decoded.provider,
        };

        next();
    } catch (error) {
        // Optional auth should not block guest users.
        // If token is invalid, continue as guest.
        next();
    }
};