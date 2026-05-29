import { Request, Response, NextFunction } from "express";
import { JwtPayloadData, verifyToken } from "../utils/jwt";
import { validateHeaderValue } from "http";
import { verify } from "crypto";

export interface AuthRequest extends Request {
    user?: JwtPayloadData;
}

// now the middleware
export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};