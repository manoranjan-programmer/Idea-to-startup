const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Feasibility = require("../models/Feasibility");

const router = express.Router();

/* ===================== GEMINI CONFIG ===================== */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const primaryModel = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: {
    temperature: 0.3,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

const fallbackModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/* ===================== ADVANCED RETRY FUNCTION ===================== */
async function generateWithRetry(prompt, retries = 5) {
  let delay = 2000; // start with 2 sec

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🚀 Attempt ${i + 1}`);
      return await primaryModel.generateContent(prompt);
    } catch (err) {
      console.log(`⚠️ Attempt ${i + 1} failed:`, err.message);

      // if last retry -> break
      if (i === retries - 1) break;

      // wait before retry
      console.log(`⏳ Waiting ${delay / 1000}s before retry...`);
      await new Promise((res) => setTimeout(res, delay));

      // exponential increase
      delay *= 2;
    }
  }

  /* ================= FALLBACK ================= */
  try {
    console.log("⚠️ Switching to fallback model...");
    return await fallbackModel.generateContent(prompt);
  } catch (err) {
    console.log("❌ Fallback also failed:", err.message);
    throw new Error("All AI models are currently overloaded");
  }
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
          metricAnalyses: {
            technical: "Heuristic technical feasibility.",
            market: "Heuristic market feasibility.",
            research: "Heuristic research feasibility.",
            innovation: "Heuristic innovation assessment.",
          },
          techStackSuggestion: {
            frontend: ["React.js"],
            backend: ["Node.js", "Express.js"],
            database: ["MongoDB"],
            infrastructure: ["AWS"],
          },
          strengths: ["Basic feasibility signals detected"],
          risks: ["Heuristic evaluation only"],
          futureScope: ["Enable AI analysis for full roadmap"],
          marketTrends: [],
          detailedAnalysis:
            "This feasibility analysis was generated without AI.",
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
        message: "AI servers are busy. Please try again later.",
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

    const aiResult = JSON.parse(match[0]);

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
        aiSummary: aiResult.aiSummary || "AI analysis completed.",
        metricAnalyses: aiResult.metricAnalyses || {},
        techStackSuggestion: aiResult.techStackSuggestion || {
          frontend: [],
          backend: [],
          database: [],
          infrastructure: [],
        },
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
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
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