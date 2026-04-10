const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Feasibility = require("../models/Feasibility");

const router = express.Router();

/* ===================== GEMINI CONFIG ===================== */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ===================== AVAILABLE MODELS ===================== */
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

/* ===================== TIMEOUT FUNCTION ===================== */
const withTimeout = (promise, ms = 15000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request Timeout")), ms)
    ),
  ]);
};

/* ===================== RETRY + FALLBACK ===================== */
async function generateWithRetry(prompt, retries = 4) {
  let delay = 2000;

  for (let attempt = 0; attempt < retries; attempt++) {
    for (let modelName of MODELS) {
      try {
        console.log(`🚀 Attempt ${attempt + 1} using ${modelName}`);

        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
          },
        });

        const result = await withTimeout(
          model.generateContent(prompt),
          15000
        );

        console.log(`✅ Success with ${modelName}`);
        return result;
      } catch (err) {
        console.log(`⚠️ ${modelName} failed: ${err.message}`);

        // Retry only for overload / timeout errors
        if (
          err.message.includes("503") ||
          err.message.toLowerCase().includes("overloaded") ||
          err.message.includes("Timeout")
        ) {
          continue;
        } else {
          throw err;
        }
      }
    }

    console.log(`⏳ Waiting ${delay / 1000}s before retry...`);
    await new Promise((res) => setTimeout(res, delay));
    delay *= 2;
  }

  throw new Error("All Gemini models are overloaded. Try again later.");
}

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
   POST: AI / DOCUMENT FEASIBILITY ANALYSIS
========================================================= */
router.post("/", async (req, res) => {
  try {
    console.log("📩 Feasibility request:", req.body);

    const {
      idea,
      shortDescription,
      problemStatement,
      market,
      documentText,
      budget,
      useAI,
    } = req.body;

    if (!idea && !documentText && !shortDescription) {
      return res.status(400).json({
        success: false,
        message: "Idea, short description, or document content is required",
      });
    }

    const analysisContext =
      shortDescription ||
      problemStatement ||
      market ||
      documentText ||
      "No context provided";

    /* ================= TEMP MODE ================= */
    if (useAI === false) {
      const technical = Math.floor(Math.random() * 20) + 70;
      const marketScore = technical - 4;
      const research = technical - 6;
      const innovation = technical - 3;

      const feasibilityScore = calculateFeasibilityScore({
        technical,
        market: marketScore,
        research,
        innovation,
      });

      return res.status(200).json({
        success: true,
        source: "TEMP",
        data: {
          idea: idea || "Extracted from document",
          shortDescription,
          problemStatement: analysisContext,
          budget,
          feasibilityScore,
          technicalScore: technical,
          marketScore,
          researchScore: research,
          innovationScore: innovation,
          aiSummary:
            "Temporary heuristic feasibility estimate. Enable AI for detailed analysis.",
          metricAnalyses: {},
          techStackSuggestion: {},
          strengths: ["Basic feasibility signals detected"],
          risks: ["Heuristic evaluation only"],
          futureScope: ["Enable AI analysis"],
          marketTrends: [],
          detailedAnalysis: "Generated without AI",
          verdict: "Temporary estimate",
        },
      });
    }

    /* ================= AI MODE ================= */
    console.log("🤖 GEMINI AI MODE ENABLED");

    const prompt = `...same prompt (no change)...`;

    let result;
    try {
      result = await generateWithRetry(prompt);
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: err.message,
      });
    }

    const rawText = result.response.text();

    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({
        success: false,
        message: "Failed to parse Gemini response",
        raw: rawText,
      });
    }

    let aiResult;
    try {
      aiResult = JSON.parse(match[0]);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Invalid JSON from AI",
        raw: rawText,
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

    return res.status(200).json({
      success: true,
      source: "GEMINI",
      data: {
        idea: idea || "Extracted from document",
        shortDescription,
        problemStatement: analysisContext,
        budget,
        feasibilityScore,
        technicalScore: technical,
        marketScore,
        researchScore: research,
        innovationScore: innovation,
        aiSummary: aiResult.aiSummary || "",
        metricAnalyses: aiResult.metricAnalyses || {},
        techStackSuggestion: aiResult.techStackSuggestion || {},
        strengths: aiResult.strengths || [],
        risks: aiResult.risks || [],
        futureScope: aiResult.futureScope || [],
        marketTrends: aiResult.marketTrends || [],
        detailedAnalysis: aiResult.detailedAnalysis || "",
        verdict: aiResult.verdict || "Needs review",
      },
    });
  } catch (error) {
    console.error("❌ Gemini Feasibility Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "AI feasibility analysis failed",
      error: error.message,
    });
  }
});

/* ================= SAVE RESULT ================= */
router.post("/save", async (req, res) => {
  try {
    const record = await Feasibility.create(req.body);
    res.status(201).json({ success: true, id: record._id });
  } catch (err) {
    console.error("❌ Save Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to save feasibility",
    });
  }
});

/* ================= GET BY ID ================= */
router.get("/:id", async (req, res) => {
  try {
    const result = await Feasibility.findById(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feasibility",
    });
  }
});

module.exports = router;