const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Temporary OTP store (replace with DB/Redis later)
const otpStore = new Map();

/* ===================== VERIFY OTP ===================== */
async function verifyOtp(req, res, next) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  const storedOtp = otpStore.get(email);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  otpStore.delete(email); // OTP used → delete
  next();
}

/* ===================== SIGNUP ===================== */
async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8+ chars, include uppercase, lowercase, number & special char",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local",
      isVerified: true, // since OTP verified
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      userId: user._id,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { signup, verifyOtp, otpStore };