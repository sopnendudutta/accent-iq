import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { exchangeGoogleOAuthToken } from "../services/api";
import type { AuthUser } from "../types/auth";

type OAuthCallbackProps = {
    onAuthSuccess: (user: AuthUser) => void;
};

type OAuthStatus = "loading" | "error";

function getOAuthHandoffToken() {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    return hashParams.get("handoff") || hashParams.get("token");
}

function OAuthCallback({ onAuthSuccess }: OAuthCallbackProps) {
    const navigate = useNavigate();
    const hasStartedRef = useRef(false);
    const [status, setStatus] = useState<OAuthStatus>("loading");
    const [message, setMessage] = useState("Completing Google login...");

    useEffect(() => {
        let isMounted = true;

        async function completeGoogleLogin() {
            if (hasStartedRef.current) {
                return;
            }

            hasStartedRef.current = true;

            const handoffToken = getOAuthHandoffToken();

            window.history.replaceState(null, document.title, window.location.pathname);

            if (!handoffToken) {
                if (!isMounted) {
                    return;
                }

                setStatus("error");
                setMessage("Google login could not be completed. Please try again.");
                return;
            }

            try {
                const response = await exchangeGoogleOAuthToken(handoffToken);
                const token = response.data?.token || response.data?.accessToken;
                const user = response.data?.user;

                if (!token || !user) {
                    throw new Error("Google login response was incomplete.");
                }

                localStorage.setItem("accentiq_token", token);
                onAuthSuccess(user);
                navigate("/pronunciation", { replace: true });
            } catch (error) {
                console.error(error);

                if (!isMounted) {
                    return;
                }

                setStatus("error");
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Google login could not be completed. Please try again."
                );
            }
        }

        void completeGoogleLogin();

        return () => {
            isMounted = false;
        };
    }, [navigate, onAuthSuccess]);

    return (
        <section className="page auth-page oauth-callback-page">
            <div className="auth-card oauth-callback-card">
                <div className="auth-card-header">
                    <span className="logo-mark">A</span>
                    <div>
                        <h2>Google Login</h2>
                        <p>Connecting your AccentIQ session.</p>
                    </div>
                </div>

                <div
                    className={
                        status === "error"
                            ? "auth-message auth-message-error"
                            : "auth-message auth-message-info"
                    }
                >
                    <strong>{status === "error" ? "OAuth issue" : "Please wait"}</strong>
                    <p>{message}</p>
                </div>

                {status === "error" && (
                    <div className="oauth-callback-actions">
                        <Link className="secondary-cta" to="/login">
                            Back to login
                        </Link>
                        <Link className="primary-cta" to="/pronunciation">
                            Continue as guest
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

export default OAuthCallback;
