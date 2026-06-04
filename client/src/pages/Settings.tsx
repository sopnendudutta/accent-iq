import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { AuthUser } from "../types/auth";
import {
    DEFAULT_ACCENT_OPTIONS,
    PRACTICE_GOAL_OPTIONS,
    getUserPreferences,
    resetUserPreferences,
    saveUserPreferences,
} from "../utils/preferences";
import type {
    AccentIQUserPreferences,
    DefaultAccent,
    PracticeGoal,
} from "../utils/preferences";

type ThemeMode = "light" | "dark";

type SettingsProps = {
    user: AuthUser | null;
    isAuthLoading: boolean;
    theme: ThemeMode;
    onThemeToggle: () => void;
    onLogout: () => void | Promise<void>;
};

function getProfileLabel(user: AuthUser | null) {
    if (!user) {
        return "Guest";
    }

    return user.name || user.email;
}

function getInitials(user: AuthUser | null) {
    const label = getProfileLabel(user);

    if (!label) {
        return "A";
    }

    const parts = label.trim().split(" ");

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return label.slice(0, 2).toUpperCase();
}

function getPracticeGoalLabel(goal: PracticeGoal) {
    return (
        PRACTICE_GOAL_OPTIONS.find((option) => option.value === goal)?.label ||
        "Casual"
    );
}

function Settings({
    user,
    isAuthLoading,
    theme,
    onThemeToggle,
    onLogout,
}: SettingsProps) {
    const navigate = useNavigate();

    const [preferences, setPreferences] = useState<AccentIQUserPreferences>(() =>
        getUserPreferences()
    );

    const [preferencesMessage, setPreferencesMessage] = useState(
        "These preferences are saved on this device."
    );

    const provider = user && "provider" in user ? String(user.provider) : "EMAIL";

    async function handleSettingsLogout() {
        await onLogout();
        navigate("/", { replace: true });
    }

    function updatePreferences(updatedPreferences: Partial<AccentIQUserPreferences>) {
        setPreferences((currentPreferences) => ({
            ...currentPreferences,
            ...updatedPreferences,
        }));

        setPreferencesMessage("You have unsaved preference changes.");
    }

    function handleSavePreferences() {
        saveUserPreferences(preferences);
        setPreferencesMessage("Preferences saved successfully.");
    }

    function handleResetPreferences() {
        const defaultPreferences = resetUserPreferences();
        setPreferences(defaultPreferences);
        setPreferencesMessage("Preferences reset to AccentIQ defaults.");
    }

    return (
        <section className="page settings-page">
            <div className="settings-hero">
                <div>
                    <span className="home-eyebrow">Account & preferences</span>
                    <h1>Manage your AccentIQ experience.</h1>

                    <p>
                        View your account status, switch between light and dark mode, and
                        customize simple pronunciation practice preferences.
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
                    <div className="settings-card profile-overview-card">
                        <div className="profile-overview-header">
                            <div className="profile-avatar">{getInitials(user)}</div>

                            <div>
                                <span className="result-label">Account</span>

                                <h2>
                                    {isAuthLoading
                                        ? "Checking account..."
                                        : user
                                            ? getProfileLabel(user)
                                            : "Guest user"}
                                </h2>

                                <p>
                                    {user
                                        ? "Your account is connected and ready for saved practice history."
                                        : "You can practice as a guest, but history is only saved after login."}
                                </p>
                            </div>
                        </div>

                        {isAuthLoading ? (
                            <p className="loading-message">Checking account status...</p>
                        ) : user ? (
                            <>
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

                                <div className="account-action-row">
                                    <Link className="primary-cta" to="/pronunciation">
                                        Continue Practice
                                    </Link>

                                    <button
                                        type="button"
                                        className="secondary-button danger-soft-button"
                                        onClick={handleSettingsLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
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

                                    <Link className="secondary-cta" to="/pronunciation">
                                        Try as guest
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="settings-card">
                        <span className="result-label">Available now</span>
                        <h2>Your current AccentIQ setup</h2>

                        <div className="current-feature-list">
                            <div>
                                <strong>Text pronunciation practice</strong>
                                <span>Available</span>
                            </div>

                            <div>
                                <strong>Light and dark mode</strong>
                                <span>Available</span>
                            </div>

                            <div>
                                <strong>Pronunciation history</strong>
                                <span>
                                    {user ? "Available for your account" : "Login required"}
                                </span>
                            </div>

                            <div>
                                <strong>Voice pronunciation upload</strong>
                                <span>Coming soon</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-card">
                        <span className="result-label">Practice preferences</span>
                        <h2>Pronunciation defaults</h2>

                        <p>
                            Choose a default accent, practice goal, and how much guidance
                            AccentIQ should show when you analyze a word.
                        </p>

                        <div className="settings-preferences-form">
                            <div className="form-grid-two">
                                <div className="form-field">
                                    <label htmlFor="defaultAccent">Default accent</label>

                                    <select
                                        id="defaultAccent"
                                        value={preferences.defaultAccent}
                                        onChange={(event) =>
                                            updatePreferences({
                                                defaultAccent: event.target.value as DefaultAccent,
                                            })
                                        }
                                    >
                                        {DEFAULT_ACCENT_OPTIONS.map((accent) => (
                                            <option key={accent.value} value={accent.value}>
                                                {accent.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="practiceGoal">Practice goal</label>

                                    <select
                                        id="practiceGoal"
                                        value={preferences.practiceGoal}
                                        onChange={(event) =>
                                            updatePreferences({
                                                practiceGoal: event.target.value as PracticeGoal,
                                            })
                                        }
                                    >
                                        {PRACTICE_GOAL_OPTIONS.map((goal) => (
                                            <option key={goal.value} value={goal.value}>
                                                {goal.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <label
                                className="settings-checkbox-row"
                                htmlFor="showTipsByDefault"
                            >
                                <input
                                    id="showTipsByDefault"
                                    type="checkbox"
                                    checked={preferences.showTipsByDefault}
                                    onChange={(event) =>
                                        updatePreferences({
                                            showTipsByDefault: event.target.checked,
                                        })
                                    }
                                />

                                <span>
                                    <strong>Show detailed tips by default</strong>
                                    <small>
                                        Turn this off if you prefer a cleaner result card.
                                    </small>
                                </span>
                            </label>

                            <label
                                className="settings-checkbox-row"
                                htmlFor="rememberLastAccent"
                            >
                                <input
                                    id="rememberLastAccent"
                                    type="checkbox"
                                    checked={preferences.rememberLastAccent}
                                    onChange={(event) =>
                                        updatePreferences({
                                            rememberLastAccent: event.target.checked,
                                        })
                                    }
                                />

                                <span>
                                    <strong>Remember my last used accent</strong>
                                    <small>
                                        When enabled, your most recently used accent opens first.
                                    </small>
                                </span>
                            </label>

                            <div className="settings-preference-summary">
                                <div>
                                    <span>Default accent</span>
                                    <strong>{preferences.defaultAccent}</strong>
                                </div>

                                <div>
                                    <span>Practice goal</span>
                                    <strong>{getPracticeGoalLabel(preferences.practiceGoal)}</strong>
                                </div>

                                <div>
                                    <span>Detailed tips</span>
                                    <strong>
                                        {preferences.showTipsByDefault ? "Shown" : "Hidden"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Last accent</span>
                                    <strong>
                                        {preferences.rememberLastAccent
                                            ? preferences.lastUsedAccent || "Not used yet"
                                            : "Disabled"}
                                    </strong>
                                </div>
                            </div>

                            <p className="history-message">{preferencesMessage}</p>

                            <div className="settings-actions">
                                <button
                                    type="button"
                                    className="primary-cta"
                                    onClick={handleSavePreferences}
                                >
                                    Save Preferences
                                </button>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleResetPreferences}
                                >
                                    Reset Defaults
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="settings-side-column">
                    <div className="settings-card compact-settings-card">
                        <span className="result-label">Current mode</span>
                        <h3>{theme === "light" ? "Warm Light" : "Calm Dark"}</h3>
                        <p>AccentIQ keeps your selected theme saved after refresh.</p>
                    </div>

                    <div className="settings-card compact-settings-card">
                        <span className="result-label">Account status</span>
                        <h3>{user ? "Signed in" : "Guest mode"}</h3>
                        <p>
                            {user
                                ? "Your pronunciation history can be saved to your account."
                                : "Guest practice works, but history will not be saved."}
                        </p>
                    </div>

                    <div className="settings-card compact-settings-card">
                        <span className="result-label">Preference storage</span>
                        <h3>Local device</h3>
                        <p>
                            These V1 preferences use localStorage, so no backend or Prisma
                            changes are needed.
                        </p>
                    </div>
                </aside>
            </div>

            <div className="settings-feature-grid">
                <div className="settings-feature-card">
                    <span>👤</span>
                    <h3>Profile editing</h3>
                    <p>Update name, photo, and advanced profile preferences later.</p>
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