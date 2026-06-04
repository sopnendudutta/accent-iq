import { Link } from "react-router";
import type { AuthUser } from "../../types/auth";

type NavbarProps = {
    user: AuthUser | null;
    isAuthLoading: boolean;
    onLogout: () => void;
};

function Navbar({ user, isAuthLoading, onLogout }: NavbarProps) {
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

                {isAuthLoading ? (
                    <span className="auth-status">Checking...</span>
                ) : user ? (
                    <>
                        <span className="auth-status">
                            Hi, {user.name || user.email}
                        </span>

                        <button className="logout-button" type="button" onClick={onLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Navbar;