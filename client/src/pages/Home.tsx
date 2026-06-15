import { Link } from "react-router";

const learningSteps = [
    {
        title: "Type or speak",
        text: "Start with a word, sentence, or browser voice-to-text transcript.",
    },
    {
        title: "Choose an accent",
        text: "Practice across American, British, Australian, Indian, Canadian, Irish, New Zealand, and South African English.",
    },
    {
        title: "Read the coach notes",
        text: "See phonetic spelling, syllables, mouth guidance, tips, and an example.",
    },
];

function Home() {
    return (
        <section className="home-page">
            <div className="home-hero">
                <div className="home-hero-content">
                    <h1>Practice English pronunciation with calm, clear guidance.</h1>

                    <p className="home-lead">
                        Type a word or speak into the browser, then AccentIQ explains
                        how to shape the sound in plain language.
                    </p>

                    <div className="home-actions">
                        <Link className="primary-cta" to="/pronunciation">
                            Try pronunciation now
                        </Link>

                        <Link className="secondary-cta" to="/register">
                            Create free account
                        </Link>
                    </div>

                    <div className="home-highlights">
                        <div>
                            <strong>Guest friendly</strong>
                            <span>Practice without creating an account.</span>
                        </div>

                        <div>
                            <strong>Voice-to-text ready</strong>
                            <span>
                                Speak to fill the text box. Raw audio is not saved by
                                AccentIQ.
                            </span>
                        </div>

                        <div>
                            <strong>Save your practice</strong>
                            <span>
                                Login to keep pronunciation history and favorites.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="home-learning-section">
                <div className="home-section-heading">
                    <span className="result-label">How it works</span>
                    <h2>One focused practice flow.</h2>
                </div>

                <div className="home-learning-grid">
                    {learningSteps.map((step) => (
                        <article key={step.title}>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Home;
