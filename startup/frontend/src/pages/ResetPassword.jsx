import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email and otp from the navigation state passed from ForgotPassword
  const email = location.state?.email;
  const otp = location.state?.otp;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  /* =====================
      SAFETY REDIRECT
  ===================== */
  useEffect(() => {
    // If user tries to access this page directly without an OTP from ForgotPassword
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // Password Validation
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongPassword.test(password)) {
      setMessageType("error");
      setMessage("Password must be 8+ characters (Upper, Lower, Number, Special).");
      return;
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword: password 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType("error");
        setMessage(data.message || "Reset failed. OTP may be expired.");
        return;
      }

      setMessageType("success");
      setMessage("Password updated successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);

    } catch (err) {
      console.error("Reset error:", err);
      setMessageType("error");
      setMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Create New Password</h2>
        <p className="reset-subtitle">Resetting password for <b>{email}</b></p>

        {/* ✅ DYNAMIC INLINE MESSAGE BOX */}
        {message && (
          <div 
            className="inline-message-box" 
            style={{
              borderColor: messageType === "success" ? "#22c55e" : "#f87171",
              color: messageType === "success" ? "#22c55e" : "#f87171",
              backgroundColor: messageType === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(248, 113, 113, 0.1)"
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="reset-field">
            <label htmlFor="password">New Password</label>
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                id="password"
                className="reset-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="reset-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              className="reset-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="reset-footer">
          <p>
            Changed your mind? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;