import "dotenv/config";
import { parse } from "node:path";
import { parseEnv } from "node:util";
import { z } from "zod";


const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    CORS_ORIGIN: z.string().default("http://localhost:5173")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("invalid environment variables", parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsedEnv.data;