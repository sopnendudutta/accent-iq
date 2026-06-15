import { Link } from "react-router";

function About() {
    return (
        <section className="page about-page">
            <div className="about-hero">
                <div>
                    <h1>Pronunciation practice that feels simple and friendly.</h1>

                    <p>
                        AccentIQ helps learners practice English pronunciation across
                        different accents using beginner-friendly guidance, syllables,
                        stress patterns, voice-to-text input, and practice tips.
                    </p>

                    <div className="about-actions">
                        <Link className="primary-cta" to="/pronunciation">
                            Start practicing
                        </Link>

                        <Link className="secondary-cta" to="/register">
                            Create free account
                        </Link>
                    </div>
                </div>
            </div>

            <div className="about-section-grid">
                <div className="about-card">
                    <h3>Accent options</h3>
                    <p>
                        AccentIQ supports multiple English accent options, including
                        American, British, Australian, Indian, Canadian, Irish, New
                        Zealand, and South African English.
                    </p>
                </div>
            </div>

            <div className="about-info-layout">
                <div className="about-panel">
                    <span className="result-label">Available now</span>
                    <h2>What AccentIQ can do today</h2>

                    <div className="about-list">
                        <div>
                            <strong>Guest pronunciation analysis</strong>
                            <span>Try the app without creating an account.</span>
                        </div>

                        <div>
                            <strong>Browser voice-to-text</strong>
                            <span>Speak to fill the text box before analyzing.</span>
                        </div>

                        <div>
                            <strong>Logged-in history and favorites</strong>
                            <span>Save useful pronunciation practice after login.</span>
                        </div>

                        <div>
                            <strong>Light and dark mode</strong>
                            <span>Choose the visual mode that feels comfortable.</span>
                        </div>
                    </div>
                </div>

                <div className="about-panel about-panel-warm">
                    <span className="result-label">Coming later</span>
                    <h2>Planned future improvements</h2>

                    <div className="about-list">
                        <div>
                            <strong>Real audio pronunciation scoring</strong>
                            <span>Analyze spoken pronunciation quality more deeply.</span>
                        </div>

                        <div>
                            <strong>Progress tracking</strong>
                            <span>Track consistency and learning improvement over time.</span>
                        </div>

                        <div>
                            <strong>More accent and practice tools</strong>
                            <span>Add richer practice flows after the current foundation.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="about-safety-note">
                <span className="result-label">Safety note</span>
                <h2>Built carefully, one version at a time.</h2>

                <p>
                    Login is optional. Guest users can practice without an account.
                    Voice-to-text uses browser speech recognition to fill the text box,
                    and AccentIQ does not save raw audio. Real audio pronunciation scoring
                    is planned for a later version.
                </p>
            </div>
        </section>
    );
}

export default About;
