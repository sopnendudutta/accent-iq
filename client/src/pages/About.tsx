import { Link } from "react-router";

function About() {
    return (
        <section className="page about-page">
            <div className="about-hero">
                <div>
                    <span className="home-eyebrow">About AccentIQ</span>

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

                <div className="about-summary-card">
                    <span className="result-label">V1 focus</span>
                    <h2>Text and voice-to-text pronunciation help</h2>

                    <p>
                        In this version, users can type a word or use browser
                        voice-to-text, select an accent, and get simple pronunciation
                        guidance.
                    </p>
                </div>
            </div>

            <div className="about-section-grid">
                <div className="about-card">
                    <span>🎯</span>
                    <h3>Our goal</h3>
                    <p>
                        Help learners speak more clearly by making pronunciation practice
                        easier to understand and repeat.
                    </p>
                </div>

                <div className="about-card">
                    <span>🌍</span>
                    <h3>Accent options</h3>
                    <p>
                        AccentIQ supports multiple English accent options like US, UK,
                        Australian, and Indian English in V1.
                    </p>
                </div>

                <div className="about-card">
                    <span>📚</span>
                    <h3>Beginner-friendly</h3>
                    <p>
                        Feedback is shown in readable sections: phonetics, IPA, syllables,
                        stress, guidance, and practice.
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
                            <span>Add richer practice flows after the V1 foundation.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="about-safety-note">
                <span className="result-label">Safety note</span>
                <h2>Built carefully, one version at a time.</h2>

                <p>
                    Login is optional in V1. Guest users can practice without an account.
                    Voice-to-text uses browser speech recognition to fill the text box,
                    and AccentIQ does not save raw audio. Real audio pronunciation scoring
                    is planned for a later version.
                </p>
            </div>
        </section>
    );
}

export default About;