import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(5000),

    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    CORS_ORIGIN: z.string().default("http://localhost:5173"),

    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("7d"),

    PRONUNCIATION_ENGINE: z.enum(["mock", "ai"]).default("mock"),

    AI_PROVIDER: z.enum(["gemini", "groq", "auto"]).default("gemini"),

    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
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
