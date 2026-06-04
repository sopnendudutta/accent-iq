import { Link } from "react-router";

function NotFound() {
    return (
        <section className="page not-found-page">
            <div className="not-found-card">
                <span className="not-found-code">404</span>

                <span className="home-eyebrow">Page not found</span>

                <h1>This page took the wrong accent path.</h1>

                <p>
                    The page you are looking for does not exist, or the link may have
                    changed.
                </p>

                <div className="not-found-actions">
                    <Link className="primary-cta" to="/">
                        Go back home
                    </Link>

                    <Link className="secondary-cta" to="/pronunciation">
                        Practice pronunciation
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default NotFound;