import { Link } from "react-router";

function Home() {
    return (
        <section className="home-page">
            <div className="home-hero">
                <div className="home-hero-content">


                    <h1>Practice English pronunciation with simple accent guidance.</h1>

                    <p className="home-lead">
                        Type or speak and get clear pronunciation help.
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
        </section>
    );
}

export default Home;