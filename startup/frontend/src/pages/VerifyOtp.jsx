import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const location = useLocation();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔐 Values passed from Signup
  const email = location.state?.email;
  const password = location.state?.password;

  /* =====================
     SAFETY REDIRECT
  ===================== */
  useEffect(() => {
    if (!email || !password) {
      navigate("/signup");
    }
  }, [email, password, navigate]);

  /* =====================
     VERIFY OTP
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!otp) {
      setMessage("Please enter the OTP.");
      setMessageType("error");
      return;
    }

    try {
      setVerifying(true);

      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          password, // 🔐 finalize password after OTP
        }),
      });

      const data = await res.json();
      setVerifying(false);

      if (res.ok) {
        setMessage("Email verified successfully! Redirecting to login...");
        setMessageType("success");

        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setMessage(data.message || "Invalid OTP. Please signup again.");
        setMessageType("error");

        setTimeout(() => {
          navigate("/signup");
        }, 1500);
      }
    } catch (err) {
      setVerifying(false);
      console.error("OTP verification error:", err);
      setMessage("Server error. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Verify Email</h2>
        <p className="login-subtitle">
          Enter the OTP sent to <b>{email}</b>
        </p>

        {message && (
          <div className={`form-message ${messageType}`}>
            {message}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={verifying}>
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
