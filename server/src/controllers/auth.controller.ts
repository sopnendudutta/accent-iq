import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
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

export const googleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.status(501).json({
            success: false,
            message: "Google OAuth backend route is ready, but token verification is not implemented yet.",
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