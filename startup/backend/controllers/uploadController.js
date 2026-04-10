// controllers/uploadController.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");

/* ===================== GEMINI CONFIG ===================== */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

/* ===================== CLEAN JSON FUNCTION ===================== */
const extractJSON = (text) => {
  try {
    if (!text) return null;

    // ❌ Remove markdown (```json, ```)
    let cleaned = text.replace(/```json|```/gi, "").trim();

    // ❌ Remove leading text before first {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    cleaned = cleaned.substring(start, end + 1);

    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
};

const analyzeFeasibility = async (req, res) => {
  try {
    /* ================= VALIDATION ================= */
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractedText = "";

    /* ================= TEXT EXTRACTION ================= */
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype === "text/plain") {
      extractedText = req.file.buffer.toString("utf-8");
    } else {
      return res.status(400).json({
        error: "Only PDF and TXT files are supported",
      });
    }

    if (!extractedText || extractedText.length < 100) {
      return res.status(400).json({
        error: "Document too short for analysis",
      });
    }

    /* ================= IMPROVED PROMPT ================= */
    const prompt = `
You are a senior startup feasibility analyst.

STRICT RULES:
- Return ONLY valid JSON
- DO NOT add explanations
- DO NOT use markdown (no \`\`\`)
- DO NOT add text before or after JSON

DOCUMENT:
"""
${extractedText.slice(0, 12000)}
"""

OUTPUT FORMAT:

{
  "idea": "",
  "technicalScore": 0,
  "marketScore": 0,
  "researchScore": 0,
  "innovationScore": 0,
  "aiSummary": "",
  "metricAnalyses": {
    "technical": "",
    "market": "",
    "research": "",
    "innovation": ""
  },
  "techStackSuggestion": {
    "frontend": [],
    "backend": [],
    "database": [],
    "infrastructure": []
  },
  "strengths": [],
  "risks": [],
  "futureScope": [],
  "marketTrends": [],
  "detailedAnalysis": "",
  "verdict": ""
}
`;

    /* ================= GEMINI API CALL ================= */
    const result = await model.generateContent(prompt);

    const raw = result.response.text();

    console.log("🔍 RAW GEMINI RESPONSE:\n", raw);

    if (!raw || raw.length < 10) {
      throw new Error("Empty Gemini response");
    }

    /* ================= SAFE JSON PARSE ================= */
    let aiResult = extractJSON(raw);

    if (!aiResult) {
      console.error("❌ JSON PARSE FAILED");

      return res.status(500).json({
        error: "Invalid JSON from AI",
        rawResponse: raw,
      });
    }

    /* ================= SCORE ================= */
    const technicalScore = clamp(aiResult.technicalScore);
    const marketScore = clamp(aiResult.marketScore);
    const researchScore = clamp(aiResult.researchScore);
    const innovationScore = clamp(aiResult.innovationScore);

    const feasibilityScore = Math.round(
      (technicalScore + marketScore + researchScore + innovationScore) / 4
    );

    /* ================= FINAL RESULT ================= */
    const finalResult = {
      idea: aiResult.idea || "Not extracted",
      feasibilityScore,
      technicalScore,
      marketScore,
      researchScore,
      innovationScore,

      aiSummary: aiResult.aiSummary || "",

      metricAnalyses: aiResult.metricAnalyses || {
        technical: "",
        market: "",
        research: "",
        innovation: "",
      },

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
      verdict: aiResult.verdict || "Needs Review",
    };

    return res.status(200).json(finalResult);

  } catch (error) {
    console.error("❌ GEMINI ERROR:", error);

    return res.status(500).json({
      error: "Feasibility analysis failed",
      details: error.message,
    });
  }
};

module.exports = { analyzeFeasibility };