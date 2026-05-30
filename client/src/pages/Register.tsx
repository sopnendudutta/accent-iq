import { useState } from "react";
import { registerUser } from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!name.trim() || !email.trim() || !password.trim()) {
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

            if (token) {
                localStorage.setItem("accentiq_token", token);
            }

            setMessage(response.message || "Account created successfully.");
        } catch (error) {
            console.error(error);

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
        <section className="page">
            <h1>Create Account</h1>

            <p>
                Signup is optional in V1. Creating an account will later help you save
                pronunciation history and track progress.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                />

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
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

export default Register;