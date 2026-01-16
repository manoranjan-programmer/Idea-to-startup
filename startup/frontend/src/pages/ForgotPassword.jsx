import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step 1: Email Input, Step 2: OTP Input
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* =====================
      STEP 1: REQUEST OTP
  ===================== */
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setMessage("OTP sent to your email!");
      setMessageType("success");
      setStep(2); // Switch to the OTP input field
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
      STEP 2: VERIFY & NAVIGATE
  ===================== */
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    
    if (!otp || otp.length < 4) {
      setMessage("Please enter a valid OTP code.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    // Navigate to ResetPassword.jsx and pass email/otp via state
    // Use a slight timeout to simulate verification processing
    setTimeout(() => {
      navigate("/reset-password", { 
        state: { 
          email: email, 
          otp: otp 
        } 
      });
    }, 800);
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2 className="forgot-title">
          {step === 1 ? "Forgot Password" : "Verify OTP"}
        </h2>
        <p className="forgot-subtitle">
          {step === 1 
            ? "Enter your registered email to receive a reset code." 
            : `Enter the code sent to ${email}`}
        </p>

        {/* ✅ DYNAMIC INLINE MESSAGE BOX (Styled like your image) */}
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

        {step === 1 ? (
          /* STEP 1: EMAIL FORM */
          <form onSubmit={handleRequestOtp} className="forgot-form">
            <div className="forgot-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="forgot-button" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP FORM */
          <form onSubmit={handleVerifyOtp} className="forgot-form">
            <div className="forgot-field">
              <label>OTP Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="forgot-button" disabled={loading}>
              {loading ? "Processing..." : "Verify & Continue"}
            </button>
            <button 
              type="button" 
              className="back-button" 
              onClick={() => {
                setStep(1);
                setMessage("");
                setOtp("");
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#6366f1', 
                marginTop: '15px', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'block',
                width: '100%',
                textAlign: 'center',
                textDecoration: 'underline'
              }}
            >
              Back to Email
            </button>
          </form>
        )}

        <div className="forgot-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Remembered your password?{" "}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 'bold' }}>
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;