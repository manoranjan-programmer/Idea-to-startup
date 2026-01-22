const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const User = require("../models/User");

const router = express.Router();

/* ===========================
   SUPABASE CLIENT
=========================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/* ===========================
   AUTH MIDDLEWARE
=========================== */
const isAuthenticated = (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ message: "Not authenticated" });
};

/* ===========================
   MULTER CONFIG (AVATARS)
=========================== */
const uploadDir = path.resolve(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/.test(file.mimetype);
    cb(allowed ? null : new Error("Only images allowed"), allowed);
  },
});

/* ===========================
   HELPER
=========================== */
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  const baseUrl = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000";
  return `${baseUrl}${avatarPath}`;
};

/* ======================================================
   SIGNUP → SEND OTP (SUPABASE EMAIL OTP)
====================================================== */
router.post("/signup", async (req, res) => {
  // ✅ Added 'password' to req.body
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 🔥 Send OTP via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // ✅ Hash the password before saving temporarily
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store temp user (unverified) with the password
    await User.create({
      name,
      email,
      password: hashedPassword, // ✅ Now password will exist in DB
      provider: "email",
      isVerified: false,
       
    });

    res.status(200).json({
      message: "OTP sent to email successfully",
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   FORGOT PASSWORD → SEND OTP
====================================================== */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Trigger Supabase Reset Password OTP
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: "Password reset OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   RESET PASSWORD → VERIFY OTP & PREVENT OLD PASSWORD
====================================================== */
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1. Find the user in MongoDB first
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. SAFETY CHECK: Compare new password with existing hashed password
    // If the user has a password (not a Google-only user), check if it's being reused
    if (user.password) {
      const isSameAsOld = await bcrypt.compare(newPassword, user.password);
      if (isSameAsOld) {
        return res.status(400).json({ 
          message: "New password cannot be the same as your old password." 
        });
      }
    }

    // 3. Verify the OTP with Supabase
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery' // Specifically for reset password tokens
    });

    if (error) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 4. Hash the new password and save to MongoDB
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Ensure the provider is set to email if they are resetting a password
    user.provider = "email"; 
    
    await user.save();

    res.json({ message: "Password updated successfully. Please login." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   VERIFY OTP (SUPABASE)
====================================================== */
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const supabaseUser = data.user;

    // Update MongoDB user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    user.supabaseUserId = supabaseUser.id;
    await user.save();

    res.json({
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   LOGIN (FIXED BCRYPT ERROR)
=========================== */
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    // 1. Check if user exists
    if (!user) return res.status(400).json({ message: "User not found" });
    
    // 2. Check if user has a password (might be a Google-only user)
    if (!user.password) {
      return res.status(400).json({ message: "Please log in using Google" });
    }

    // 3. Check verification
    if (!user.isVerified)
      return res.status(400).json({ message: "Verify email first" });

    // 4. ✅ bcrypt.compare will now have two valid strings
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ message: "Login successful" });
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   GOOGLE AUTH (UNCHANGED)
=========================== */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    req.user.isVerified = true;
    await req.user.save();
    res.redirect(`${process.env.GOOGLE_CLIENT_URL}/select-idea`);
  }
);

router.post(
  "/update-profile",
  isAuthenticated,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update name
      if (req.body.name && req.body.name.trim()) {
        user.name = req.body.name.trim();
      }

      // Update avatar
      if (req.file) {
        // Delete old avatar
        if (user.avatar) {
          const oldPath = path.join(__dirname, "..", user.avatar);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        // Save relative path in DB
        user.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: getAvatarUrl(user.avatar), // ✅ FULL URL
        },
      });
    } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);


/* ===========================
   GET CURRENT USER
=========================== */
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ name: user.name, email: user.email, avatar: getAvatarUrl(user.avatar) });
  } catch (err) {
    console.error("Get Me Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   LOGOUT
=========================== */
router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("startup.sid");
      res.json({ message: "Logged out" });
    });
  });
});

module.exports = router;