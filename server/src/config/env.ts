import "dotenv/config";
import { z } from "zod";

const optionalString = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().optional()
);

const optionalUrl = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional()
);

const clientUrl = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().default("http://localhost:5173")
);

const envSchema = z.object({
    PORT: z.coerce.number().default(5000),

    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),

    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("7d"),

    PRONUNCIATION_ENGINE: z.enum(["mock", "ai"]).default("mock"),

    AI_PROVIDER: z.enum(["gemini", "groq", "auto"]).default("gemini"),

    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

    GROQ_API_KEY: z.string().optional(),
    GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),

    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
    GOOGLE_CALLBACK_URL: optionalUrl,
    CLIENT_URL: clientUrl,
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
