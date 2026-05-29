import { Link } from "react-router";

function NotFound() {
    return (
        <section className="page">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/">Go back home</Link>
        </section>
    );
}

export default NotFound;