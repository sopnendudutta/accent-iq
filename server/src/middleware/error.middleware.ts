import type { ErrorRequestHandler, RequestHandler } from "express";

type AppError = Error & {
    statusCode?: number;
};

export const notFoundHandler: RequestHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

export const errorHandler: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error"
    });
};