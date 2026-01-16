// controllers/uploadController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");

/* ===================== GEMINI CONFIG ===================== */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

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
        error: "Only PDF and TXT files are supported for AI feasibility analysis",
      });
    }

    if (!extractedText || extractedText.length < 100) {
      return res.status(400).json({
        error: "Document content is too short for feasibility analysis",
      });
    }

    /* ================= GEMINI PROMPT ================= */
    const prompt = `
You are a senior startup feasibility analyst.
Analyze the following startup document and return ONLY valid JSON.

DOCUMENT CONTENT:
"""
${extractedText.slice(0, 12000)}
"""

Please do the following:
1. Extract the main startup idea in one concise sentence as "idea".
2. Evaluate and score from 0–100:
   - Technical feasibility
   - Market feasibility
   - Research readiness
   - Innovation level
3. Provide a 2–3 line executive summary as "aiSummary".
4. Provide detailed metric analyses under "metricAnalyses".
5. Suggest a suitable tech stack under "techStackSuggestion".
6. List "strengths", "risks", "futureScope", and "marketTrends".
7. Provide a "detailedAnalysis" explanation.
8. Give a final "verdict" (Viable | Needs Work | Not Viable).

Respond with ONLY valid JSON:

{
  "idea": "concise startup idea extracted from document",
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

    /* ================= GEMINI API CALL ================= */
    const result = await model.generateContent(prompt);
    const raw = result?.output_text || result?.response?.text?.() || "";

    if (!raw || raw.length < 10) {
      throw new Error("Empty Gemini response");
    }

    /* ================= SAFE JSON PARSE ================= */
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({
        error: "Gemini response parsing failed",
        rawResponse: raw,
      });
    }

    const aiResult = JSON.parse(match[0]);

    /* ================= SCORE NORMALIZATION ================= */
    const technicalScore = clamp(aiResult.technicalScore);
    const marketScore = clamp(aiResult.marketScore);
    const researchScore = clamp(aiResult.researchScore);
    const innovationScore = clamp(aiResult.innovationScore);

    const feasibilityScore = Math.round(
      (technicalScore + marketScore + researchScore + innovationScore) / 4
    );

    /* ================= FINAL RESULT ================= */
    const finalResult = {
      idea: aiResult.idea || "Idea could not be extracted",
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

    res.status(200).json(finalResult);
  } catch (error) {
    console.error("❌ Gemini Feasibility Error:", error.message);
    res.status(500).json({
      error: "AI feasibility analysis failed",
      details: error.message,
    });
  }
};

module.exports = { analyzeFeasibility };
