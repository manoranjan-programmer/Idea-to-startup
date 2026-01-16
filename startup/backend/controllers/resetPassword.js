const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const User = require("../models/User");

/* =========================
   SUPABASE CLIENT
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // ✅ ANON key is correct for emails
);

/* =====================================================
   FORGOT PASSWORD → SEND RESET LINK (SUPABASE EMAIL)
   POST /auth/forgot-password
===================================================== */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email, provider: "local" });

    // 🔐 Security: don't reveal whether user exists
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    /* =========================
       GENERATE RESET TOKEN
    ========================= */
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetLink = `${process.env.GOOGLE_CLIENT_URL}/reset-password/${resetToken}`;

    /* =========================
       SEND EMAIL USING SUPABASE
    ========================= */
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: resetLink,
        data: {
          type: "reset-password",
          resetLink,
        },
      },
    });

    if (error) {
      console.error("Supabase email error:", error);
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   RESET PASSWORD
   POST /auth/reset-password/:token
===================================================== */
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    /* =========================
       HASH TOKEN
    ========================= */
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    /* =========================
       STRONG PASSWORD CHECK
    ========================= */
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars with uppercase, lowercase, number & special character",
      });
    }

    /* =========================
       PREVENT OLD PASSWORD REUSE
    ========================= */
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as your old password",
      });
    }

    /* =========================
       SAVE NEW PASSWORD
    ========================= */
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
