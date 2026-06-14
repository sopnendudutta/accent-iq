import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
    console.log(`AccentIQ API running on http://localhost:${env.PORT}`);
    console.log("AccentIQ runtime config", {
        pronunciationEngine: env.PRONUNCIATION_ENGINE,
        aiProvider: env.AI_PROVIDER,
        geminiModel: env.GEMINI_MODEL,
        hasGeminiApiKey: Boolean(env.GEMINI_API_KEY),
        groqModel: env.GROQ_MODEL,
        hasGroqApiKey: Boolean(env.GROQ_API_KEY),
        trustProxyHops: env.TRUST_PROXY_HOPS,
    });
});

process.on("SIGINT", () => {
    console.log("Server shutting down...");
    server.close(() => {
        process.exit(0);
    });
});
