import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayloadData } from "../utils/jwt";
import { AppError } from "../utils/appError";

export interface AuthRequest extends Request {
    user?: JwtPayloadData;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Access denied. No token provided.", 401);
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        next(new AppError("Invalid or expired token.", 401));
    }
};