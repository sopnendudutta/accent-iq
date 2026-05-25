import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
    console.log(`AccentIQ API running on http://localhost:${env.PORT}`);
});

process.on("SIGINT", () => {
    console.log("Server shutting down...");
    server.close(() => {
        process.exit(0);
    });
});