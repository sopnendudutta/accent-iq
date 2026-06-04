import { Link } from "react-router";
import type { AuthUser } from "../types/auth";

type ThemeMode = "light" | "dark";

type SettingsProps = {
    user: AuthUser | null;
    isAuthLoading: boolean;
    theme: ThemeMode;
    onThemeToggle: () => void;
};

function Settings({
    user,
    isAuthLoading,
    theme,
    onThemeToggle,
}: SettingsProps) {
    const provider =
        user && "provider" in user ? String(user.provider) : "EMAIL";

    return (
        <section className="page settings-page">
            <div className="settings-hero">
                <div>
                    <span className="home-eyebrow">Account & preferences</span>
                    <h1>Manage your AccentIQ experience.</h1>

                    <p>
                        View your account status, switch between light and dark mode, and
                        see what profile features are planned for future versions.
                    </p>
                </div>

                <div className="settings-theme-card">
                    <span className="result-label">Theme</span>
                    <h2>{theme === "light" ? "Light mode" : "Dark mode"}</h2>
                    <p>
                        Choose the display mode that feels most comfortable while
                        practicing.
                    </p>

                    <button
                        type="button"
                        className="primary-cta settings-theme-button"
                        onClick={onThemeToggle}
                    >
                        Switch to {theme === "light" ? "Dark" : "Light"} Mode
                    </button>
                </div>
            </div>

            <div className="settings-layout">
                <div className="settings-main-column">
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <span className="logo-mark">A</span>

                            <div>
                                <span className="result-label">Account</span>
                                <h2>Your profile</h2>
                            </div>
                        </div>

                        {isAuthLoading ? (
                            <p className="loading-message">Checking account status...</p>
                        ) : user ? (
                            <div className="profile-info-grid">
                                <div>
                                    <span>Name</span>
                                    <strong>{user.name || "Not added yet"}</strong>
                                </div>

                                <div>
                                    <span>Email</span>
                                    <strong>{user.email}</strong>
                                </div>

                                <div>
                                    <span>Provider</span>
                                    <strong>{provider}</strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>Logged in</strong>
                                </div>
                            </div>
                        ) : (
                            <div className="guest-settings-box">
                                <h3>You are using AccentIQ as a guest.</h3>

                                <p>
                                    You can still practice pronunciation, but login is needed to
                                    save and view pronunciation history.
                                </p>

                                <div className="settings-actions">
                                    <Link className="primary-cta" to="/login">
                                        Login
                                    </Link>

                                    <Link className="secondary-cta" to="/register">
                                        Create account
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="settings-card">
                        <span className="result-label">Practice preferences</span>
                        <h2>Pronunciation defaults</h2>

                        <p>
                            In a future version, this section can let users choose their
                            default accent, saved practice goal, and preferred practice style.
                        </p>

                        <div className="settings-preference-list">
                            <div>
                                <strong>Default accent</strong>
                                <span>Coming soon</span>
                            </div>

                            <div>
                                <strong>Practice reminder</strong>
                                <span>Coming soon</span>
                            </div>

                            <div>
                                <strong>Saved favorites</strong>
                                <span>Coming soon</span>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="settings-side-column">
                    <div className="settings-card compact-settings-card">
                        <span className="result-label">Current mode</span>
                        <h3>{theme === "light" ? "Warm Light" : "Calm Dark"}</h3>
                        <p>
                            AccentIQ keeps your selected theme saved after refresh.
                        </p>
                    </div>

                    <div className="settings-card compact-settings-card">
                        <span className="result-label">Security note</span>
                        <h3>Account-first features</h3>
                        <p>
                            History and profile features should stay connected to logged-in
                            users only.
                        </p>
                    </div>
                </aside>
            </div>

            <div className="settings-feature-grid">
                <div className="settings-feature-card">
                    <span>👤</span>
                    <h3>Profile editing</h3>
                    <p>Update name, photo, and personal practice preferences later.</p>
                </div>

                <div className="settings-feature-card">
                    <span>⭐</span>
                    <h3>Favorites</h3>
                    <p>Save difficult words and revisit them during practice.</p>
                </div>

                <div className="settings-feature-card">
                    <span>📈</span>
                    <h3>Progress tracking</h3>
                    <p>Track consistency, saved words, and pronunciation improvement.</p>
                </div>

                <div className="settings-feature-card">
                    <span>🎙️</span>
                    <h3>Voice practice</h3>
                    <p>Voice input and audio scoring are planned for a future version.</p>
                </div>
            </div>
        </section>
    );
}

export default Settings;