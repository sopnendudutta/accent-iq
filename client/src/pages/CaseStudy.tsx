import { Link } from "react-router";

const releaseChapters = [
    {
        label: "V1",
        title: "Stable product foundation",
        text: "Guest practice, email auth, JWT sessions, history, favorites, preferences, light and dark mode, and browser voice-to-text.",
    },
    {
        label: "V2",
        title: "AI guidance and product redesign",
        text: "Gemini pronunciation guidance, safe mock fallback, expanded accents, simplified results, and a warmer full-screen interface.",
    },
    {
        label: "V3",
        title: "Portfolio-ready polish",
        text: "Google OAuth, streaks, personalized recommendations, privacy planning, case study, and final documentation polish.",
    },
];

const architectureSteps = [
    "React and Vite frontend handles practice flow, auth state, saved progress, and learner-facing UI.",
    "Express API validates requests, checks optional auth, and routes pronunciation, auth, history, and favorites.",
    "Pronunciation service chooses Gemini AI or the mock fallback based on safe environment configuration.",
    "Prisma stores users, auth providers, pronunciation history, favorites, and account-linked progress in Neon PostgreSQL.",
    "Vercel serves the frontend while Render runs the backend API.",
];

const stackItems = [
    "React",
    "TypeScript",
    "Vite",
    "React Router",
    "Node.js",
    "Express",
    "Prisma",
    "PostgreSQL",
    "JWT auth",
    "Google OAuth",
    "Gemini AI",
    "Vercel",
    "Render",
    "Neon",
];

const safetyItems = [
    "Gemini output is routed through a backend service, not called directly from the browser.",
    "Mock pronunciation guidance remains available when AI is disabled, missing, or failing.",
    "Frontend copy avoids real voice-scoring claims because V3 does not process raw audio.",
    "Recommendations use saved activity, favorites, streaks, and accent coverage only.",
];

const privacyItems = [
    "Browser voice-to-text fills the text box; AccentIQ does not upload or store raw audio in V3.",
    "Saved history is text-based and tied to logged-in accounts.",
    "Guest users can practice without account storage.",
    "Future audio scoring is blocked until consent, storage, retention, provider review, and deletion are solved.",
];

const skippedItems = [
    "Raw audio upload",
    "Raw audio storage",
    "Real voice pronunciation scoring",
    "Speech disorder diagnosis",
    "Medical or therapeutic claims",
    "Meta OAuth before Google OAuth is stable",
];

const futureItems = [
    "Real audio scoring with explicit consent and deletion controls",
    "More structured lesson paths for common practice goals",
    "Richer analytics after trustworthy scoring data exists",
    "More accessibility and localization polish",
];

function CaseStudy() {
    return (
        <section className="case-study-page">
            <section className="case-study-hero">
                <div className="case-study-hero-copy">
                    <span className="home-eyebrow">AccentIQ case study</span>
                    <h1>A full-stack AI pronunciation coach built with safety first.</h1>
                    <p>
                        AccentIQ is a portfolio-ready pronunciation practice app that
                        combines React, Express, Prisma, PostgreSQL, OAuth, and Gemini AI
                        with honest privacy boundaries around voice input.
                    </p>

                    <div className="case-study-actions">
                        <Link className="primary-cta" to="/pronunciation">
                            Try AccentIQ
                        </Link>
                        <Link className="secondary-cta" to="/progress">
                            View progress tools
                        </Link>
                    </div>
                </div>

                <aside className="case-study-hero-panel">
                    <span className="result-label">Project snapshot</span>
                    <div className="case-study-snapshot-row">
                        <strong>Frontend</strong>
                        <span>React, TypeScript, Vercel</span>
                    </div>
                    <div className="case-study-snapshot-row">
                        <strong>Backend</strong>
                        <span>Express, Prisma, Render</span>
                    </div>
                    <div className="case-study-snapshot-row">
                        <strong>AI layer</strong>
                        <span>Gemini with mock fallback</span>
                    </div>
                    <div className="case-study-snapshot-row">
                        <strong>Safety line</strong>
                        <span>No raw audio upload in V3</span>
                    </div>
                </aside>
            </section>

            <section className="case-study-section case-study-intro-grid">
                <div>
                    <span className="result-label">What AccentIQ is</span>
                    <h2>Clear pronunciation guidance for everyday practice.</h2>
                    <p>
                        Learners can type a word or use browser voice-to-text, choose an
                        English accent, and receive readable guidance: phonetic spelling,
                        syllables, mouth notes, tips, and an example sentence.
                    </p>
                </div>

                <div>
                    <span className="result-label">Problem</span>
                    <h2>Pronunciation tools often feel too technical or too vague.</h2>
                    <p>
                        AccentIQ focuses on calm, repeatable explanations instead of
                        overwhelming learners with hidden scoring, clinical language, or
                        dashboard noise.
                    </p>
                </div>
            </section>

            <section className="case-study-section">
                <div className="case-study-section-header">
                    <span className="result-label">Version story</span>
                    <h2>Built in checkpoints, with risk handled before scope.</h2>
                </div>

                <div className="case-study-chapter-grid">
                    {releaseChapters.map((chapter) => (
                        <article key={chapter.label} className="case-study-chapter">
                            <span>{chapter.label}</span>
                            <h3>{chapter.title}</h3>
                            <p>{chapter.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="case-study-section case-study-stack-section">
                <div className="case-study-section-header">
                    <span className="result-label">Tech stack</span>
                    <h2>Production-style full-stack architecture.</h2>
                    <p>
                        The project uses familiar production tools across frontend,
                        backend, database, AI, authentication, and deployment.
                    </p>
                </div>

                <div className="case-study-stack-list">
                    {stackItems.map((item) => (
                        <span key={item}>{item}</span>
                    ))}
                </div>
            </section>

            <section className="case-study-section case-study-architecture">
                <div className="case-study-section-header">
                    <span className="result-label">Architecture</span>
                    <h2>One focused path from learner input to saved progress.</h2>
                </div>

                <ol className="case-study-flow">
                    {architectureSteps.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            </section>

            <section className="case-study-section case-study-safety-band">
                <div>
                    <span className="result-label">AI safety and fallback</span>
                    <h2>AI is useful, but the app stays honest when AI is unavailable.</h2>
                </div>

                <ul>
                    {safetyItems.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>

            <section className="case-study-section case-study-two-column">
                <div>
                    <span className="result-label">Privacy decisions</span>
                    <h2>Voice input stays transcript-based in V3.</h2>
                    <ul className="case-study-list">
                        {privacyItems.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <span className="result-label">Deployment</span>
                    <h2>Designed for a real hosted demo.</h2>
                    <p>
                        The frontend deploys to Vercel, the backend runs on Render, and
                        Neon PostgreSQL stores account and practice data through Prisma.
                    </p>
                    <p>
                        Google OAuth uses backend redirects so email login, guest
                        practice, and production auth can coexist cleanly.
                    </p>
                </div>
            </section>

            <section className="case-study-section case-study-two-column">
                <div>
                    <span className="result-label">Not built yet</span>
                    <h2>Some features were intentionally postponed.</h2>
                    <ul className="case-study-list">
                        {skippedItems.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <span className="result-label">Future improvements</span>
                    <h2>Next steps after the privacy foundation is stronger.</h2>
                    <ul className="case-study-list">
                        {futureItems.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="case-study-final">
                <span className="result-label">Final result</span>
                <h2>AccentIQ is a complete full-stack AI project with visible product judgment.</h2>
                <p>
                    The project shows auth, AI routing, fallback behavior, persistence,
                    personalization, privacy planning, and production deployment without
                    overstating what the product can measure.
                </p>
            </section>
        </section>
    );
}

export default CaseStudy;
