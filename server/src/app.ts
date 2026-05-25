import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import healthRoutes from "./routes/health.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { success } from "zod";

const app = express();
app.use(helmet());

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        Message: "Too many requests.Please try again later."
    }
}));

app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use("/api", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
