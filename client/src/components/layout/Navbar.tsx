import { useState } from "react";
import { Link, NavLink } from "react-router";
import type { AuthUser } from "../../types/auth";

type ThemeMode = "light" | "dark";

type NavbarProps = {
    user: AuthUser | null;
    isAuthLoading: boolean;
    onLogout: () => void;
    theme: ThemeMode;
    onThemeToggle: () => void;
};

function Navbar({
    user,
    isAuthLoading,
    onLogout,
    theme,
    onThemeToggle,
}: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function closeMenu() {
        setIsMenuOpen(false);
    }

    function getNavLinkClass({ isActive }: { isActive: boolean }) {
        return isActive ? "nav-link nav-link-active" : "nav-link";
    }

    function handleLogoutClick() {
        onLogout();
        closeMenu();
    }

    return (
        <header className={`navbar ${isMenuOpen ? "navbar-open" : ""}`}>
            <div className="navbar-inner">
                <div className="navbar-logo">
                    <Link to="/" onClick={closeMenu}>
                        <span className="logo-mark">A</span>
                        <span>AccentIQ</span>
                    </Link>
                </div>

                <button
                    className="mobile-menu-button"
                    type="button"
                    aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isMenuOpen}
                    aria-controls="main-navigation"
                    onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <nav id="main-navigation" className="navbar-links">
                    <div className="navbar-main-links">
                        <NavLink className={getNavLinkClass} to="/" onClick={closeMenu}>
                            Home
                        </NavLink>

                        <NavLink
                            className={getNavLinkClass}
                            to="/pronunciation"
                            onClick={closeMenu}
                        >
                            Pronunciation
                        </NavLink>

                        <NavLink className={getNavLinkClass} to="/about" onClick={closeMenu}>
                            About
                        </NavLink>

                        <NavLink
                            className={getNavLinkClass}
                            to="/settings"
                            onClick={closeMenu}
                        >
                            Settings
                        </NavLink>
                    </div>

                    <div className="navbar-actions">
                        <button
                            className="theme-toggle-button"
                            type="button"
                            onClick={onThemeToggle}
                        >
                            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                        </button>

                        {isAuthLoading ? (
                            <span className="auth-status">Checking...</span>
                        ) : user ? (
                            <>
                                <span className="auth-status">
                                    Hi, {user.name || user.email}
                                </span>

                                <button
                                    className="logout-button"
                                    type="button"
                                    onClick={handleLogoutClick}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    className={({ isActive }) =>
                                        isActive ? "nav-link auth-link nav-link-active" : "nav-link auth-link"
                                    }
                                    to="/login"
                                    onClick={closeMenu}
                                >
                                    Login
                                </NavLink>

                                <NavLink
                                    className={({ isActive }) =>
                                        isActive ? "nav-cta nav-cta-active" : "nav-cta"
                                    }
                                    to="/register"
                                    onClick={closeMenu}
                                >
                                    Register
                                </NavLink>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;