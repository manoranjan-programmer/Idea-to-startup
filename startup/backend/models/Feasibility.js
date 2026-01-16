// models/Feasibility.js
const mongoose = require("mongoose");

const FeasibilitySchema = new mongoose.Schema(
  {
    /* ===== IDEA ===== */
    idea: { type: String, required: true },        // AI-refined idea
    extractedIdea: String,                         // Extracted from text doc
    feasibilityScore: { type: Number, required: true },

    /* ===== ANALYSIS ===== */
    futureScope: [String],
    marketTrends: [String],
    risks: [String],
    detailedAnalysis: String,

    /* ===== TEXT DOCUMENT INFO ===== */
    document: {
      originalName: String,
      fileType: String,
      fileSize: Number,
      content: String,                             // FULL text file content
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feasibility", FeasibilitySchema);
