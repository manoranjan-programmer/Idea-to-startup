import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectionPage.css";

const SelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
        { credentials: "include" }
      );

      if (!res.ok) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      setUser(data);
      setAvatarKey(Date.now()); 
    } catch (err) {
      console.error("Fetch user error:", err);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [location]); 

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="selection-container">
      {/* ================= TOP BAR (Fixed to top) ================= */}
      <div className="selection-topbar">
        <div className="logo">💡 Startup Analyzer</div>

        <div className="profile-wrapper">
          <div className="profile-trigger" onClick={() => setShowDropdown((v) => !v)}>
            <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
            <img
              src={
                user.avatar
                  ? `${user.avatar}?v=${avatarKey}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="profile-icon"
            />
          </div>

          {showDropdown && (
            <>
              <div className="dropdown-backdrop" onClick={() => setShowDropdown(false)} />
              <div className="profile-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-name">{user.name}</div>
                  <div className="dropdown-email">{user.email}</div>
                </div>

                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/profile");
                  }}
                >
                  ✎ My Profile
                </div>

                <div
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= SELECTION CARD (Centered) ================= */}
      <div className="selection-card-wrapper">
        <div className="selection-card">
          <h1 className="selection-title">Choose How to Submit Your Idea</h1>

          <p className="selection-subtitle">
            Select the method you prefer to share your startup idea for analysis.
          </p>

          <div className="selection-options">
            <button
              className="selection-button primary"
              onClick={() => navigate("/idea-text")}
            >
              💡 Idea by Text
              <span>Type your idea manually</span>
            </button>

            <button
              className="selection-button secondary"
              onClick={() => navigate("/idea-document")}
            >
              📄 Idea by Document
              <span>Upload a TXT document</span>
            </button>
          </div>

          <div className="selection-footer">
            You can change this later if needed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionPage;