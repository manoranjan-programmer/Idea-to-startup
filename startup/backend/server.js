const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const {MongoStore} = require("connect-mongo");
require("dotenv").config();

const app = express();

/* ===================== ENV ===================== */
const PORT = process.env.PORT || 5000;
const BASE_URL =
  process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}`;

/* ===================== DB CONNECTION & INDEX FIX ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async (m) => {
    console.log("✅ MongoDB connected successfully");

    try {
      const User = m.model("User");

      // 1. Cleanup literal null values
      await User.updateMany(
        { supabaseUserId: null },
        { $unset: { supabaseUserId: "" } }
      );
      console.log("🧹 Cleaned up literal null values");

      // 2. Drop old index if exists
      await User.collection
        .dropIndex("supabaseUserId_1")
        .catch(() => {
          console.log("ℹ️ Old index not found or already removed");
        });

      // 3. Sync indexes (partial index active)
      await User.syncIndexes();
      console.log("✅ Database indexes synchronized");
    } catch (err) {
      console.warn("⚠️ Index maintenance skipped:", err.message);
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ===================== TRUST PROXY ===================== */
app.set("trust proxy", 1);

/* ===================== BODY PARSERS ===================== */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ===================== CORS CONFIG ===================== */
const allowedOrigins = [
  process.env.GOOGLE_CLIENT_URL, // frontend prod
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

/* ===================== SESSION CONFIG (FIXED) ===================== */
app.use(
  session({
    name: "startup.sid",
    secret: process.env.SESSION_SECRET || "secret_fallback_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // ✅ CORRECT FOR v5+
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: "native",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* ===================== PASSPORT ===================== */
app.use(passport.initialize());
app.use(passport.session());

/* ===================== STATIC FILES (UPLOADS FIX) ===================== */
const uploadsPath = path.join(__dirname, "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsPath));

/* ===================== ROUTES ===================== */
app.use("/auth", require("./routes/auth"));
app.use("/api/feasibility", require("./routes/feasibility"));
app.use("/api/upload", require("./routes/uploadRoutes"));

/* ===================== HEALTH CHECK ===================== */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "🚀 Backend running",
    loggedIn: !!req.user,
    environment: process.env.NODE_ENV || "development",
    baseUrl: BASE_URL,
  });
});

/* ===================== GLOBAL ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ===================== START SERVER ===================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${BASE_URL}`);
});
