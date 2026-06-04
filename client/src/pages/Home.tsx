import { useEffect, useState } from "react";
import { Link } from "react-router";
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
        <section className="page home-page">
            <div className="home-hero">
                <div className="home-hero-content">
                    <span className="home-eyebrow">Accent practice made simple</span>

                    <h1>Speak clearer across English accents.</h1>

                    <p className="home-lead">
                        AccentIQ helps you practice pronunciation with simple text-based
                        guidance, accent options, syllables, stress patterns, and speaking
                        tips.
                    </p>

                    <div className="home-actions">
                        <Link className="primary-cta" to="/pronunciation">
                            Start practicing
                        </Link>

                        <Link className="secondary-cta" to="/register">
                            Create free account
                        </Link>
                    </div>

                    <div className="home-highlights">
                        <div>
                            <strong>Guest friendly</strong>
                            <span>No login needed to try V1</span>
                        </div>

                        <div>
                            <strong>Multiple accents</strong>
                            <span>US, UK, Australian, Indian</span>
                        </div>

                        <div>
                            <strong>Progress ready</strong>
                            <span>Logged-in users get history</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home;