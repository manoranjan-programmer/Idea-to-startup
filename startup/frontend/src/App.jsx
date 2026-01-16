import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ================= PAGES =================
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import IdeaSubmission from "./pages/IdeaSubmission";
import Feasibility from "./pages/Feasibility";
import SelectionPage from "./pages/SelectionPage";
import UploadDocument from "./pages/UploadDocument";
import Profile from "./pages/Profile";

const App = () => {
  // Initialize as false so the UI renders immediately without waiting
  const [isAuth, setIsAuth] = useState(false); 
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Function to check auth status - updates state silently in the background
  const checkAuth = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, { credentials: "include" });
      setIsAuth(res.ok);
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [BASE_URL]);

  return (
    <Router>
      <Routes>
        {/* PUBLIC PAGES */}
        <Route path="/" element={<Homepage isAuth={isAuth} />} />
        
        {/* Login updates the global isAuth state upon success */}
        <Route path="/login" element={<Login onLoginSuccess={checkAuth} />} />
        
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* USER FLOW PAGES */}
        {/* If isAuth is false, these will still render, but you should handle 
            unauthorized access inside the components or via a ProtectedRoute wrapper */}
        <Route path="/select-idea" element={<SelectionPage />} />
        <Route path="/idea-text" element={<IdeaSubmission />} />
        <Route path="/idea-document" element={<UploadDocument />} />
        <Route path="/feasibility-result" element={<Feasibility />} />
        <Route path="/profile" element={<Profile />} />

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;