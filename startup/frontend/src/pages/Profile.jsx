import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const avatarRef = useRef(null);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 🔔 normal message state
  const [message, setMessage] = useState(null); 
  // { type: "success" | "error", text: "" }

  /* ================= FETCH USER ================= */
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
      setName(data.name || "");
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  /* ================= AVATAR MENU ================= */
  const handleMenuClick = () => {
    if (avatarRef.current) {
      avatarRef.current.scrollIntoView({ behavior: "smooth" });
    }

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
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/remove-avatar`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Failed to remove photo" });
        return;
      }

      setPreview(null);
      setFile(null);
      setShowMenu(false);
      setMessage({ type: "success", text: "Profile photo removed successfully" });

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
      formData.append("name", name);
      if (file) formData.append("avatar", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/update-profile`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Update failed" });
        return;
      }

      setMessage({ type: "success", text: "Profile updated successfully" });

      setPreview(null);
      setFile(null);

      await fetchUser();

      // optional delay before redirect
      setTimeout(() => {
        navigate("/select-idea");
      }, 800);

    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Something went wrong while saving" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* 🔔 NORMAL MESSAGE */}
        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* ================= AVATAR ================= */}
        <div className="profile-avatar-wrapper" ref={avatarRef}>
          <img
            src={
              preview ||
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profile"
            className="profile-avatar"
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
