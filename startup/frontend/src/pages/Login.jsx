import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // 🔔 inline message state
  const [message, setMessage] = useState(null);
  // { type: "success" | "error", text: "" }

  const [loading, setLoading] = useState(false);

  /* =========================
     MANUAL LOGIN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Please fill in both email and password",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Invalid email or password",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Login successful. Redirecting...",
      });

      const redirectTo = location.state?.from || "/select-idea";

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 700);
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GOOGLE LOGIN
  ========================= */
  const handleGoogleLogin = () => {
    const redirectPath = location.state?.from || "/select-idea";

    window.location.href = `${BASE_URL}/auth/google?redirect=${encodeURIComponent(
      redirectPath
    )}`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">
          Sign in to your Idea-to-Startup dashboard
        </p>

        {/* 🔔 INLINE MESSAGE */}
        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-extra">
            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password" className="reset-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* ================= DIVIDER ================= */}
        <div className="login-divider">or</div>

        {/* ================= GOOGLE LOGIN ================= */}
        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
          />
          Continue with Google
        </button>

        {/* ================= FOOTER ================= */}
        <p className="login-footer">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
