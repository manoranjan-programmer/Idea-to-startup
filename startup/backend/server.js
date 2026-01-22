const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("./config/passport");
const cors = require("cors");
const path = require("path");
const { MongoStore } = require("connect-mongo"); 
require("dotenv").config();

const app = express();

/* ===================== DB CONNECTION & INDEX FIX ===================== */
// We store the clientPromise to pass it to MongoStore for session persistence
const clientPromise = mongoose
  .connect(process.env.MONGO_URI)
  .then(async (m) => {
    console.log("✅ MongoDB connected successfully");
    
    try {
      const User = m.model('User'); 

      // 1. CLEANUP: Unset any literal 'null' values that cause E11000 errors
      await User.updateMany(
        { supabaseUserId: null }, 
        { $unset: { supabaseUserId: "" } }
      );
      console.log("🧹 Cleaned up literal null values in users collection");

      // 2. RESET INDEX: Drop old index to allow the new Partial Index to take over
      await User.collection.dropIndex('supabaseUserId_1').catch(() => {
        console.log("ℹ️ Old index not found or already updated.");
      });

      // 3. SYNC: Build indexes based on the new Partial Index logic in User.js
      await User.syncIndexes();
      console.log("✅ Database indexes synchronized (Partial Index active)");
    } catch (err) {
      console.error("⚠️ Index maintenance skipped:", err.message);
    }

    return m.connection.getClient(); 
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ===================== TRUST PROXY ===================== */
// Needed for secure cookies on Render/Heroku/Railway when using HTTPS
app.set("trust proxy", 1); 

/* ===================== BODY PARSERS ===================== */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ===================== CORS CONFIG ===================== */
const allowedOrigins = [
  process.env.GOOGLE_CLIENT_URL, // React frontend prod URL
  "http://localhost:5173",       
  "http://localhost:3000",       
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Required for sessions/cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

/* ===================== SESSION CONFIG ===================== */
app.use(
  session({
    name: "startup.sid",
    secret: process.env.SESSION_SECRET || "secret_fallback_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      clientPromise: clientPromise, 
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native'
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on prod (requires HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* ===================== PASSPORT ===================== */
app.use(passport.initialize());
app.use(passport.session());

/* ===================== STATIC FILES ===================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});