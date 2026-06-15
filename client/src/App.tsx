import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router";

import Navbar from "./components/layout/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuthCallback from "./pages/OAuthCallback";
import Pronunciation from "./pages/Pronunciation";
import Progress from "./pages/Progress";
import CaseStudy from "./pages/CaseStudy";
import About from "./pages/About";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import { getCurrentUser, logoutUser } from "./services/api";
import type { AuthUser } from "./types/auth";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "accentiq_theme";

function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "dark") {
    return "dark";
  }

  return "light";
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const location = useLocation();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem("accentiq_token");

      if (!token) {
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("accentiq_token");
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  function handleAuthSuccess(userData: AuthUser) {
    setUser(userData);
  }

  function handleThemeToggle() {
    setTheme((currentTheme) => {
      return currentTheme === "light" ? "dark" : "light";
    });
  }

  async function handleLogout() {
    const token = localStorage.getItem("accentiq_token");

    try {
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("accentiq_token");
      setUser(null);
    }
  }

  return (
    <div className="app">
      <Navbar
        user={user}
        isAuthLoading={isAuthLoading}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <main className="main-content">
        <div className="route-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/pronunciation" element={<Pronunciation />} />
            <Route
              path="/progress"
              element={<Progress user={user} isAuthLoading={isAuthLoading} />}
            />
            <Route path="/case-study" element={<CaseStudy />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/settings"
              element={
                <Settings
                  user={user}
                  isAuthLoading={isAuthLoading}
                  theme={theme}
                  onThemeToggle={handleThemeToggle}
                  onLogout={handleLogout}
                />
              }
            />

            <Route
              path="/login"
              element={<Login onAuthSuccess={handleAuthSuccess} />}
            />

            <Route
              path="/register"
              element={<Register onAuthSuccess={handleAuthSuccess} />}
            />

            <Route
              path="/auth/google/callback"
              element={<OAuthCallback onAuthSuccess={handleAuthSuccess} />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
