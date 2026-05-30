import { useState } from "react";
import { loginUser } from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!email.trim() || !password.trim()) {
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

            if (token) {
                localStorage.setItem("accentiq_token", token);
            }

            setMessage(response.message || "Logged in successfully.");
        } catch (error) {
            console.error(error);

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
        <section className="page">
            <h1>Login</h1>

            <p>
                Login is optional in V1. Guests can still use pronunciation analysis.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                />

                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>
            </form>

            {message && (
                <div className="info-box">
                    <strong>Status:</strong>
                    <p>{message}</p>
                </div>
            )}
        </section>
    );
}

export default Login;