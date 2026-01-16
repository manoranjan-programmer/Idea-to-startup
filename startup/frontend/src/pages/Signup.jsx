import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  /* =====================
     PASSWORD VALIDATION
  ===================== */
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!password) return "";
    if (!regex.test(password)) {
      return "Password must be 8+ chars with uppercase, lowercase, number & special character";
    }
    return "";
  };

  /* =====================
     CHECK EMAIL EXISTS
  ===================== */
  const checkEmailExists = async (value) => {
    if (!value) {
      setEmailExists(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/check-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      const data = await res.json();
      setEmailExists(data.exists);
    } catch (err) {
      console.error("Email check error:", err);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    checkEmailExists(e.target.value);
  };

  /* =====================
     SIGNUP → SEND OTP
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (emailExists) {
      setMessage("Email already exists. Please login instead.");
      setMessageType("error");
      return;
    }

    const name = e.target.name.value;
    const password = e.target.password.value;
    const confirmPassword = e.target["confirm-password"].value;

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    try {
      setSendingOtp(true);

      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password, 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("OTP sent to your email. Please verify.");
        setMessageType("success");

        // ✅ FIX: We must pass 'password' here because your VerifyOtp.jsx 
        // checks for 'location.state.password' in its useEffect redirect.
        setTimeout(() => {
          navigate("/verify-otp", { state: { email, password } });
        }, 1200);
      } else {
        setSendingOtp(false);
        setMessage(data.message || "Signup failed");
        setMessageType("error");
      }
    } catch (err) {
      setSendingOtp(false);
      console.error("Signup error:", err);
      setMessage("Server error. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">
          Sign up to your Idea-to-Startup dashboard
        </p>

        {message && (
          <div className={`form-message ${messageType}`}>
            {message}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="name">Full Name</label>
            <input name="name" id="name" type="text" placeholder="Your full name" required />
          </div>

          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
            />
            {emailExists && (
              <span style={{ color: "red", fontSize: "0.85rem" }}>
                Email already exists
              </span>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              id="password"
              type="password"
              placeholder="Strong password"
              required
              onChange={(e) =>
                setPasswordError(validatePassword(e.target.value))
              }
            />
            {passwordError && (
              <span style={{ color: "red", fontSize: "0.8rem" }}>
                {passwordError}
              </span>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              name="confirm-password"
              id="confirm-password"
              type="password"
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={sendingOtp}>
            {sendingOtp ? "Sending OTP..." : "Sign Up"}
          </button>
        </form>

        <div className="login-divider">or</div>

        <button
          type="button"
          className="google-button"
          onClick={() => {
            window.location.href = `${BASE_URL}/auth/google`;
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Signup with Google
        </button>

        <p className="login-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;