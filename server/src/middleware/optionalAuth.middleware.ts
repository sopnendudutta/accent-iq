import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type JwtPayLoad = {
    id?: string;
    userId?: string;
    email?: string;
};


export interface OptionalAuthRequest extends Request {
    user?: {
        id: string;
        email?: string;
    };
}

export const optionalAuth = (
    req: OptionalAuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayLoad;
        const userId = decoded.userId || decoded.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
        }
        req.user = {
            id: userId,
            email: decoded.email,
        };
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid token payload/expired token ",
        });
    }

};