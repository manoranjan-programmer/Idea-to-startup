// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const { analyzeFeasibility } = require("../controllers/uploadController");

const router = express.Router();

/* ================= MULTER CONFIG =================
   - memoryStorage (best for AI processing)
   - size limit: 20MB
   - supports PDF, TXT, Images
================================================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/tiff",
      "image/bmp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Unsupported file type. Allowed: PDF, TXT, JPG, PNG, TIFF, BMP"
        )
      );
    }
  },
});

/* =================================================
   📊 Upload document → Analyze feasibility (Groq AI)
   Endpoint: POST /api/upload/analyze
================================================== */
router.post(
  "/analyze",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  analyzeFeasibility // ✅ MUST be a function (it is now)
);

module.exports = router;
