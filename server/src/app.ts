import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import apiRoutes from "./routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import pronunciationRoutes from "./modules/pronunciation/pronunciation.routes";


const app = express();

app.use(helmet());

app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 1000,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: "Too many requests. Please try again later.",
        },
    })
);

app.use(compression());

if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Body parsers must come BEFORE routes
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));



// Routes
app.use("/api/v1", apiRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/pronunciation", pronunciationRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;