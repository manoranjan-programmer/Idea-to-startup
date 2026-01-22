import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Profile = () => {
  const navigate = useNavigate();
  const avatarRef = useRef(null);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [message, setMessage] = useState(null); 
  // { type: "success" | "error", text: "" }

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  /* ================= HELPERS ================= */
  const getAvatarSrc = () => {
    if (preview) return preview;
    if (!user?.avatar) return DEFAULT_AVATAR;

    // If backend already sends full URL
    if (user.avatar.startsWith("http")) {
      return `${user.avatar}?t=${Date.now()}`; // cache-bust
    }

    // Relative path fallback
    return `${API_BASE}${user.avatar}?t=${Date.now()}`;
  };

  /* ================= FETCH USER ================= */
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      setUser(data);
      setName(data.name || "");
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  /* ================= CLEAN PREVIEW ================= */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ================= AVATAR MENU ================= */
  const handleMenuClick = () => {
    avatarRef.current?.scrollIntoView({ behavior: "smooth" });

    if (!user?.avatar) {
      document.getElementById("avatar-input").click();
      return;
    }

    setShowMenu((prev) => !prev);
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setShowMenu(false);
    setMessage(null);
  };

  /* ================= REMOVE AVATAR ================= */
  const handleRemoveAvatar = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/remove-avatar`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Failed to remove photo",
        });
        return;
      }

      setPreview(null);
      setFile(null);
      setShowMenu(false);

      setMessage({
        type: "success",
        text: "Profile photo removed successfully",
      });

      await fetchUser();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error removing photo" });
    }
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (file) formData.append("avatar", file);

      const res = await fetch(`${API_BASE}/auth/update-profile`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.message || "Update failed",
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully",
      });

      setPreview(null);
      setFile(null);

      await fetchUser();

      setTimeout(() => navigate("/select-idea"), 800);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Something went wrong while saving",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* ================= AVATAR ================= */}
        <div className="profile-avatar-wrapper" ref={avatarRef}>
          <img
            src={getAvatarSrc()}
            alt="Profile"
            className="profile-avatar"
            onError={(e) => (e.target.src = DEFAULT_AVATAR)}
          />

          <div className="avatar-menu-icon" onClick={handleMenuClick}>
            ⋮
          </div>

          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />

          {showMenu && (
            <div className="avatar-dropdown">
              <div
                className="avatar-dropdown-item"
                onClick={() =>
                  document.getElementById("avatar-input").click()
                }
              >
                Update photo
              </div>

              {user.avatar && (
                <div
                  className="avatar-dropdown-item danger"
                  onClick={handleRemoveAvatar}
                >
                  Remove photo
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= INFO ================= */}
        <h2 className="profile-title">My Profile</h2>

        <div className="profile-field">
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
        </div>

        <div className="profile-field">
          <label>Email</label>
          <input value={user.email} disabled className="disabled-input" />
        </div>

        <button
          className="profile-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
