import { Link } from "react-router";

function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-logo">
                <Link to="/">AccentIQ</Link>
            </div>

            <nav className="navbar-links">
                <Link to="/">Home</Link>
                <Link to="/pronunciation">Pronunciation</Link>
                <Link to="/about">About</Link>
                <Link to="/settings">Settings</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </nav>
        </header>
    );
}

export default Navbar;