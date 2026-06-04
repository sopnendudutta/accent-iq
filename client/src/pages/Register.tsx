import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { registerUser } from "../services/api";
import type { AuthUser } from "../types/auth";

type RegisterProps = {
    onAuthSuccess: (user: AuthUser) => void;
};

type MessageType = "success" | "error" | "info";

function Register({ onAuthSuccess }: RegisterProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<MessageType>("info");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!name.trim() || !email.trim() || !password.trim()) {
            setMessageType("error");
            setMessage("Please fill in all fields.");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await registerUser({
                name: name.trim(),
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
            setMessage(response.message || "Account created successfully.");
        } catch (error) {
            console.error(error);

            setMessageType("error");

            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Something went wrong during registration.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="page auth-page">
            <div className="auth-layout">
                <div className="auth-benefits-panel">
                    <span className="home-eyebrow">Start for free</span>

                    <h1>Build a simple pronunciation habit.</h1>

                    <p>
                        Create an account to save your pronunciation practice history and
                        prepare for progress tracking in future AccentIQ versions.
                    </p>

                    <div className="auth-benefit-list">
                        <div>
                            <strong>Personal practice space</strong>
                            <span>Keep your pronunciation attempts in one place.</span>
                        </div>

                        <div>
                            <strong>Beginner-friendly feedback</strong>
                            <span>See phonetics, syllables, stress, and speaking tips.</span>
                        </div>

                        <div>
                            <strong>More features later</strong>
                            <span>Favorites, progress, and voice practice can come next.</span>
                        </div>
                    </div>
                </div>

                <div className="auth-card">
                    <div className="auth-card-header">
                        <span className="logo-mark">A</span>
                        <div>
                            <h2>Create Account</h2>
                            <p>Save your AccentIQ practice history.</p>
                        </div>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="register-name">Name</label>
                            <input
                                id="register-name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="register-email">Email</label>
                            <input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Create a password"
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {message && (
                        <div className={`auth-message auth-message-${messageType}`}>
                            <strong>Status:</strong>
                            <p>{message}</p>
                        </div>
                    )}

                    <p className="auth-switch-text">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Register;