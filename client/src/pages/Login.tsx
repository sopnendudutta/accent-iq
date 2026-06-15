import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getGoogleOAuthStartUrl, loginUser } from "../services/api";
import type { AuthUser } from "../types/auth";

type LoginProps = {
    onAuthSuccess: (user: AuthUser) => void;
};

type MessageType = "success" | "error" | "info";

const oauthMessages: Record<string, string> = {
    google_missing_config:
        "Google login is not configured yet. Please use email login for now.",
    google_denied:
        "Google login was cancelled. You can try again or use email login.",
    google_missing_code:
        "Google did not return a login code. Please try again.",
    google_missing_state:
        "Google login could not be verified. Please try again.",
    google_email_conflict:
        "This email already uses password login. Please login with email for now.",
    google_failed:
        "Google login could not be completed. Please try again or use email login.",
    failed:
        "Google login could not be completed. Please try again or use email login.",
};

function Login({ onAuthSuccess }: LoginProps) {
    const [searchParams] = useSearchParams();
    const oauthStatus = searchParams.get("oauth");
    const initialMessage = oauthStatus
        ? oauthMessages[oauthStatus] ||
        "Google login could not be completed. Please use email login for now."
        : "";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [message, setMessage] = useState(initialMessage);
    const [messageType, setMessageType] = useState<MessageType>(
        initialMessage ? "error" : "info"
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleGoogleLogin() {
        window.location.assign(getGoogleOAuthStartUrl());
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!email.trim() || !password.trim()) {
            setMessageType("error");
            setMessage("Please enter email and password.");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await loginUser({
                email: email.trim(),
                password,
            });

            const token = response.data?.token || response.data?.accessToken;
            const user = response.data?.user;

            if (token) {
                localStorage.setItem("accentiq_token", token);
            }

            if (user) {
                onAuthSuccess(user);
                navigate("/pronunciation", { replace: true });
                return;
            }

            setMessageType("success");
            setMessage(response.message || "Logged in successfully.");
        } catch (error) {
            console.error(error);

            setMessageType("error");

            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Something went wrong during login.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="page auth-page">
            <div className="auth-layout">
                <div className="auth-benefits-panel">
                    <h1>Continue your pronunciation practice.</h1>

                    <p>
                        Login to keep your AccentIQ practice history connected to your
                        account and continue improving across English accents.
                    </p>

                    <div className="auth-benefit-list">
                        <div>
                            <strong>Save practice history</strong>
                            <span>Review your recent pronunciation attempts.</span>
                        </div>

                        <div>
                            <strong>Practice across accents</strong>
                            <span>
                                Use American, British, Australian, Indian, Canadian, Irish,
                                New Zealand, and South African English options.
                            </span>
                        </div>

                        <div>
                            <strong>Guest mode still works</strong>
                            <span>You can practice without logging in too.</span>
                        </div>
                    </div>
                </div>

                <div className="auth-card">
                    <div className="auth-card-header">
                        <span className="logo-mark">A</span>
                        <div>
                            <h2>Login</h2>
                            <p>Access your AccentIQ account.</p>
                        </div>
                    </div>

                    <div className="oauth-action-panel">
                        <button
                            type="button"
                            className="auth-oauth-button"
                            onClick={handleGoogleLogin}
                            disabled={isSubmitting}
                        >
                            <span className="google-mark" aria-hidden="true">
                                G
                            </span>
                            Continue with Google
                        </button>
                    </div>

                    <div className="auth-divider">
                        <span>or use email</span>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Your password"
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {message && (
                        <div className={`auth-message auth-message-${messageType}`}>
                            <strong>Status:</strong>
                            <p>{message}</p>
                        </div>
                    )}

                    <p className="auth-switch-text">
                        New to AccentIQ? <Link to="/register">Create an account</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Login;
