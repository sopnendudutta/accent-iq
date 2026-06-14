import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/appError.js";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const oauthExchangeSchema = z.object({
    handoffToken: z.string().min(1, "OAuth handoff token is required"),
});

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedBody = registerSchema.parse(req.body);

        const result = await authService.register(validatedBody);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedBody = loginSchema.parse(req.body);

        const result = await authService.login(validatedBody);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await authService.getMe(req.user.userId);

        res.status(200).json({
            success: true,
            message: "Current user fetched successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const startGoogleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const googleAuthUrl = authService.getGoogleAuthUrl();

        if (!googleAuthUrl) {
            return res.redirect(
                authService.buildClientRedirectUrl("/login", {
                    oauth: "google_missing_config",
                })
            );
        }

        return res.redirect(googleAuthUrl);
    } catch (error) {
        next(error);
    }
};

export const handleGoogleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (typeof req.query.error === "string") {
            return res.redirect(
                authService.buildClientRedirectUrl("/login", {
                    oauth: "google_denied",
                })
            );
        }

        if (typeof req.query.code !== "string" || !req.query.code.trim()) {
            return res.redirect(
                authService.buildClientRedirectUrl("/login", {
                    oauth: "google_missing_code",
                })
            );
        }

        if (typeof req.query.state !== "string" || !req.query.state.trim()) {
            return res.redirect(
                authService.buildClientRedirectUrl("/login", {
                    oauth: "google_missing_state",
                })
            );
        }

        const result = await authService.handleGoogleCallback(
            req.query.code,
            req.query.state
        );

        return res.redirect(
            authService.buildClientRedirectUrl(
                "/auth/google/callback",
                undefined,
                {
                    handoff: result.handoffToken,
                }
            )
        );
    } catch (error) {
        const oauthError =
            error instanceof AppError && error.statusCode === 409
                ? "google_email_conflict"
                : "google_failed";

        return res.redirect(
            authService.buildClientRedirectUrl("/login", {
                oauth: oauthError,
            })
        );
    }
};

export const exchangeGoogleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedBody = oauthExchangeSchema.parse(req.body);
        const result = await authService.exchangeGoogleHandoffToken(
            validatedBody.handoffToken
        );

        res.status(200).json({
            success: true,
            message: "Google login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const metaAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(501).json({
            success: false,
            message: "Meta OAuth backend route is ready, but token verification is not implemented yet.",
        });
    } catch (error) {
        next(error);
    }
};
