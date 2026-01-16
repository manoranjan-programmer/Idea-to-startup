const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    /* ================= PASSWORD ================= */
    password: {
      type: String,
      required: function () {
        return this.provider === "email";
      },
      select: true,
    },

    /* ================= AUTH PROVIDER ================= */
    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },

    /* ================= SUPABASE ================= 
       Removed 'unique: true' and 'sparse: true' here 
       to handle it via a Partial Index below.
    ============================================== */
    supabaseUserId: {
      type: String,
      default: null, 
    },

    /* ================= VERIFICATION ================= */
    isVerified: {
      type: Boolean,
      default: false,
    },

    /* ================= RESET PASSWORD ================= */
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
    },

    /* ================= PROFILE ================= */
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
    PARTIAL UNIQUE INDEX: 
    This allows unlimited 'null' or missing supabaseUserId values.
    Uniqueness is only enforced if the value is a STRING.
========================================================= */
UserSchema.index(
  { supabaseUserId: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { supabaseUserId: { $type: "string" } } 
  }
);

/* =========================================================
    Generate reset password token
========================================================= */
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);