import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/api";

function Home() {
    const [backendStatus, setBackendStatus] = useState("Checking backend...");

    useEffect(() => {
        async function testBackend() {
            try {
                const data = await checkBackendHealth();

                setBackendStatus(data.message || "Backend is running");
            } catch (error) {
                setBackendStatus("Backend is not connected");
                console.error(error);
            }
        }

        testBackend();
    }, []);

    return (
        <section className="page">
            <h1>AccentIQ</h1>

            <p>
                Practice pronunciation across different English accents using simple
                text-based analysis.
            </p>

            <p>
                Login is optional for V1. Guests can still try pronunciation analysis.
            </p>

            <div className="status-box">
                <strong>Backend status:</strong>
                <p>{backendStatus}</p>
            </div>
        </section>
    );
}

export default Home;