const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Feasibility = require("../models/Feasibility");

const router = express.Router();

/* ===================== GEMINI CONFIG ===================== */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ===================== TIMEOUT ===================== */
const withTimeout = (promise, ms = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
};

/* ===================== RETRY ===================== */
async function generateWithRetry(prompt, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`🚀 Attempt ${attempt + 1}`);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048, // 🔥 increased
        },
      });

      const result = await withTimeout(
        model.generateContent(prompt),
        30000 // 🔥 increased timeout
      );

      return result;
    } catch (err) {
      console.log("⚠️ Retry error:", err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("Gemini failed after retries");
}

/* ===================== JSON CLEANER ===================== */
const extractJSON = (text) => {
  try {
    if (!text) return null;

    let cleaned = text.replace(/```json|```/gi, "").trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    const jsonString = cleaned.substring(start, end + 1);

    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};

/* ===================== HELPERS ===================== */
const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 50));

const calculateFeasibilityScore = ({
  technical,
  market,
  research,
  innovation,
}) =>
  Math.round(
    technical * 0.3 +
    market * 0.3 +
    research * 0.2 +
    innovation * 0.2
  );

/* =========================================================
   POST: FEASIBILITY ANALYSIS
========================================================= */
router.post("/", async (req, res) => {
  try {
    const {
      idea,
      shortDescription,
      problemStatement,
      market,
      documentText,
      useAI,
    } = req.body;

    if (!idea && !documentText && !shortDescription) {
      return res.status(400).json({
        success: false,
        message: "Idea or document required",
      });
    }

    const context =
      shortDescription ||
      problemStatement ||
      market ||
      documentText ||
      "No context";

    /* ================= TEMP MODE ================= */
    if (useAI === false) {
      const technical = 70;
      const marketScore = 65;
      const research = 60;
      const innovation = 75;

      const feasibilityScore = calculateFeasibilityScore({
        technical,
        market: marketScore,
        research,
        innovation,
      });

      return res.json({
        success: true,
        source: "TEMP",
        data: {
          idea,
          feasibilityScore,
          technicalScore: technical,
          marketScore,
          researchScore: research,
          innovationScore: innovation,
        },
      });
    }

    /* ================= AI MODE ================= */
    const prompt = `
You are a startup feasibility expert.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- Ensure JSON is COMPLETE and CLOSED

Idea: ${idea}
Context: ${context}

Return:
{
  "technicalScore": 0,
  "marketScore": 0,
  "researchScore": 0,
  "innovationScore": 0,
  "aiSummary": "",
  "strengths": [],
  "risks": [],
  "futureScope": [],
  "verdict": ""
}
`;

    let rawText = "";

    // 🔥 Retry if truncated
    for (let i = 0; i < 2; i++) {
      const result = await generateWithRetry(prompt);
      rawText = result.response.text();

      console.log("🔍 RAW:", rawText);

      if (rawText && rawText.trim().endsWith("}")) {
        break;
      }

      console.log("⚠️ Incomplete JSON, retrying...");
    }

    const aiResult = extractJSON(rawText);

    if (!aiResult) {
      console.log("❌ JSON parsing failed → fallback");

      return res.json({
        success: true,
        source: "PARSE_FALLBACK",
        data: {
          idea,
          feasibilityScore: 60,
          technicalScore: 60,
          marketScore: 60,
          researchScore: 60,
          innovationScore: 60,
          aiSummary: "AI response incomplete",
          strengths: [],
          risks: ["Invalid AI response"],
          futureScope: [],
          verdict: "Retry recommended",
        },
      });
    }

    const technical = clamp(aiResult.technicalScore);
    const marketScore = clamp(aiResult.marketScore);
    const research = clamp(aiResult.researchScore);
    const innovation = clamp(aiResult.innovationScore);

    const feasibilityScore = calculateFeasibilityScore({
      technical,
      market: marketScore,
      research,
      innovation,
    });

    return res.json({
      success: true,
      source: "GEMINI",
      data: {
        idea,
        feasibilityScore,
        technicalScore: technical,
        marketScore,
        researchScore: research,
        innovationScore: innovation,
        aiSummary: aiResult.aiSummary || "",
        strengths: aiResult.strengths || [],
        risks: aiResult.risks || [],
        futureScope: aiResult.futureScope || [],
        verdict: aiResult.verdict || "Review needed",
      },
    });

  } catch (error) {
    console.error("❌ Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/* ================= SAVE ================= */
router.post("/save", async (req, res) => {
  try {
    const record = await Feasibility.create(req.body);
    res.status(201).json({ success: true, id: record._id });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* ================= GET ================= */
router.get("/:id", async (req, res) => {
  try {
    const result = await Feasibility.findById(req.params.id);
    if (!result) return res.status(404).json({ success: false });

    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;