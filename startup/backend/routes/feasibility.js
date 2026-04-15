const express = require("express");
const Groq = require("groq-sdk");
const Feasibility = require("../models/Feasibility");

const router = express.Router();

/* ===================== GROQ CONFIG ===================== */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    /* ================= INPUT PRIORITY ================= */
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

    /* ================= AI MODE (GROQ) ================= */
    console.log("🤖 GROQ AI MODE ENABLED");

    const prompt = `
You are a senior startup feasibility analyst and technical architect.

The SHORT DESCRIPTION is the strongest signal.

STARTUP IDEA:
${idea || "Not provided"}

SHORT DESCRIPTION (PRIMARY CONTEXT):
${shortDescription || "Not provided"}

PROBLEM / MARKET / DOCUMENT CONTEXT:
${problemStatement || market || documentText || "Not provided"}

BUDGET:
${budget || "Not specified"}

Evaluate each metric from 0–100 and recommend a suitable tech stack.

Respond with ONLY valid JSON:

{
  "technicalScore": number,
  "marketScore": number,
  "researchScore": number,
  "innovationScore": number,

  "aiSummary": "2–3 line executive summary",

  "metricAnalyses": {
    "technical": "analysis",
    "market": "analysis",
    "research": "analysis",
    "innovation": "analysis"
  },

  "techStackSuggestion": {
    "frontend": ["tool"],
    "backend": ["tool"],
    "database": ["tool"],
    "infrastructure": ["tool"]
  },

  "strengths": ["..."],
  "risks": ["..."],
  "futureScope": ["..."],
  "marketTrends": ["..."],
  "detailedAnalysis": "detailed feasibility explanation",
  "verdict": "Viable | Needs Work | Not Viable"
}
`;

    const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    console.log("🤖 Using Groq model:", MODEL);

    const result = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const rawText = result.choices[0].message.content;

    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({
        success: false,
        message: "Failed to parse Groq response",
        raw: rawText,
      });
    }

    const aiResult = JSON.parse(match[0]);

    /* ================= NORMALIZE SCORES ================= */
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

    /* ================= FINAL RESPONSE ================= */
    return res.status(200).json({
      success: true,
      source: "GROQ",
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
    console.error("❌ Groq Feasibility Error:", error.message);
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