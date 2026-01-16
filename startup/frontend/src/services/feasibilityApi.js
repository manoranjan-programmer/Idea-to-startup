import axios from "axios";

/* ======================================================
   BASE URLS
====================================================== */
const API_BASE =import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FEASIBILITY_BASE_URL = `${API_BASE}/api/feasibility`;
const UPLOAD_BASE_URL = `${API_BASE}/api/upload`;
const COST_BASE_URL = `${API_BASE}/api/cost-analysis`;

/* ======================================================
   AXIOS INSTANCE (OPTIONAL BUT RECOMMENDED)
====================================================== */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================================
   1. ANALYZE IDEA (AI / RULE-BASED)
====================================================== */
export const analyzeIdea = async ({
  problemStatement,
  idea,
  market,
  budget,
  useAI = true,
}) => {
  try {
    const payload = {
      idea,
      problemStatement: problemStatement || "",
      market: market || "",
      budget: budget || "Not specified",
      useAI,
    };

    const res = await api.post("/api/feasibility", payload);
    return res.data; // { success, source, data }
  } catch (error) {
    console.error("❌ Analysis API Error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to analyze idea");
  }
};

/* ======================================================
   2. SAVE FEASIBILITY RESULT
====================================================== */
export const saveFeasibility = async (state) => {
  try {
    const payload = {
      idea: state.idea,
      feasibilityScore: Number(state.feasibilityScore),
      technicalScore: Number(state.technicalScore),
      marketScore: Number(state.marketScore),
      researchScore: Number(state.researchScore),
      innovationScore: Number(state.innovationScore),

      aiSummary: state.aiSummary || "",
      strengths: Array.isArray(state.strengths) ? state.strengths : [],
      risks: Array.isArray(state.risks) ? state.risks : [],
      futureScope: Array.isArray(state.futureScope) ? state.futureScope : [],
      marketTrends: Array.isArray(state.marketTrends)
        ? state.marketTrends
        : [],

      metricAnalyses: state.metricAnalyses || {},
      detailedAnalysis: state.detailedAnalysis || "",
      verdict: state.verdict || "Manual Review",
    };

    const res = await api.post("/api/feasibility/save", payload);
    return res.data; // { success, id }
  } catch (error) {
    console.error("❌ Save API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to save feasibility result"
    );
  }
};

/* ======================================================
   3. FETCH FEASIBILITY BY ID
====================================================== */
export const getFeasibilityById = async (id) => {
  try {
    const res = await api.get(`/api/feasibility/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Fetch API Error:", error.message);
    throw error;
  }
};

/* ======================================================
   4. UPLOAD DOCUMENT & ANALYZE
====================================================== */
export const uploadAndAnalyzeDocument = async (file) => {
  try {
    if (!file) throw new Error("No file selected");

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      `${UPLOAD_BASE_URL}/analyze`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "❌ Document Upload Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to analyze document");
  }
};

/* ======================================================
   5. PROJECT COST & EMPLOYEE ESTIMATION (NEW)
====================================================== */
export const calculateProjectCost = async ({
  ideaComplexity,     // low | medium | high
  projectDuration,    // months
  country,            // India | USA | Germany | etc
  techStack,          // web | mobile | ai | iot
  infrastructure,     // cloud | on-prem
}) => {
  try {
    const payload = {
      ideaComplexity,
      projectDuration,
      country,
      techStack,
      infrastructure,
    };

    const res = await api.post("/api/cost-analysis/calculate", payload);

    /*
      Expected response:
      {
        employeesRequired,
        averageSalary,
        salaryCost,
        resourceCost,
        infrastructureCost,
        totalProjectCost,
        breakdown: {...}
      }
    */

    return res.data;
  } catch (error) {
    console.error(
      "❌ Cost Analysis API Error:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to calculate project cost");
  }
};

/* ======================================================
   6. FETCH COUNTRY SALARY DATA (OPTIONAL DROPDOWN)
====================================================== */
export const getCountrySalaryData = async () => {
  try {
    const res = await api.get("/api/cost-analysis/countries");
    return res.data; // [{ country, avgSalary, currency }]
  } catch (error) {
    console.error("❌ Salary Data Error:", error.message);
    throw error;
  }
};
