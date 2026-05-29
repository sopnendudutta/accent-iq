import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(5000),

    NODE_ENV: z.enum(["development", "production", "test"])
        .default("development"),

    CORS_ORIGIN: z.string().default("http://localhost:5173"),

    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("7d"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        "Invalid environment variables",
        parsedEnv.error.flatten().fieldErrors
    );
    process.exit(1);
}

export const env = parsedEnv.data;