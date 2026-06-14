import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { loginUser } from "../services/api";
import type { AuthUser } from "../types/auth";

type LoginProps = {
    onAuthSuccess: (user: AuthUser) => void;
};

type MessageType = "success" | "error" | "info";

function Login({ onAuthSuccess }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<MessageType>("info");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    <span className="home-eyebrow">Welcome back</span>

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
