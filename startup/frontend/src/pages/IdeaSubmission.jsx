import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  analyzeIdea,
  saveFeasibility,
} from "../services/feasibilityApi";

import "./IdeaSubmission.css";

const IdeaSubmission = () => {
  const navigate = useNavigate();

  /* ===================== STATE ===================== */
  const [idea, setIdea] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (
      !idea.trim() ||
      !shortDescription.trim() ||
      !domain.trim() ||
      !targetUsers.trim() ||
      !problem.trim()
    ) {
      alert("⚠️ Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      /* ================= 1. CALL AI ANALYSIS ================= */
      const result = await analyzeIdea({
        idea,
        shortDescription, // ✅ NEW
        problemStatement: problem,
        market: domain,
        targetUsers,
        budget: "Not specified",
        useAI: true,
      });

      if (!result.success || !result.data) {
        throw new Error("Feasibility analysis failed to return data");
      }

      /* ================= 2. SAVE TO DATABASE ================= */
      await saveFeasibility({
        idea,
        shortDescription, // ✅ NEW
        domain,
        targetUsers,
        problem,
        feasibilityScore: result.data.feasibilityScore,
        technicalScore: result.data.technicalScore,
        marketScore: result.data.marketScore,
        researchScore: result.data.researchScore,
        innovationScore: result.data.innovationScore,
        metricAnalyses: result.data.metricAnalyses,
        aiSummary: result.data.aiSummary,
        strengths: result.data.strengths,
        risks: result.data.risks,
        futureScope: result.data.futureScope,
        marketTrends: result.data.marketTrends,
        verdict: result.data.verdict,
      });

      /* ================= 3. NAVIGATE TO RESULT PAGE ================= */
      navigate("/feasibility-result", {
        state: {
          idea,
          shortDescription, // ✅ NEW
          domain,
          targetUsers,
          problem,
          ...result.data,
        },
      });
    } catch (error) {
      console.error("❌ Feasibility Error:", error.message);
      alert(error.message || "Feasibility analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="idea-container">
      <div className="idea-card">
        <div className="header-flex">
          <h2 className="idea-title">Idea Submission</h2>
          {loading && <div className="spinner-small"></div>}
        </div>

        <p className="idea-subtitle">
          Submit your startup idea for real-time AI feasibility analysis
        </p>

        <form className="idea-form" onSubmit={handleSubmit}>
          {/* ================= ROW 1 ================= */}
          <div className="form-row">
            <div className="idea-column">
              <span className="column-label">Startup Idea</span>
              <textarea
                placeholder="e.g. AI-powered platform for crop monitoring"
                rows="3"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
            </div>

            <div className="idea-column">
              <span className="column-label">Domain</span>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="custom-select"
              >
                <option value="">Select Domain</option>
                <option>AI</option>
                <option>FinTech</option>
                <option>HealthTech</option>
                <option>EdTech</option>
                <option>Climate Tech</option>
                <option>AgriTech</option>
                <option>Cyber Security</option>
                <option>Machine learning'</option>
              </select>
            </div>
          </div>

          {/* ================= ROW 2 ================= */}
          <div className="form-row">
            <div className="idea-column">
              <span className="column-label">Short Description</span>
              <input
                placeholder="One-line summary of your idea"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              />
            </div>

            <div className="idea-column">
              <span className="column-label">Target Users</span>
              <input
                placeholder="Students, SMEs, Farmers, Enterprises..."
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
              />
            </div>
          </div>

          {/* ================= ROW 3 ================= */}
          <div className="form-row">
            <div className="idea-column">
              <span className="column-label">AI Insights Preview</span>
              <input
                className="hint-input"
                value={
                  domain
                    ? `📈 ${domain} startups are currently seeing high investor interest.`
                    : "Select a domain to see market context"
                }
                readOnly
              />
            </div>
          </div>

          {/* ================= ROW 4 ================= */}
          <div className="form-row">
            <div className="idea-column full-width">
              <span className="column-label">Problem Statement</span>
              <textarea
                placeholder="What pain point are you solving? Be specific..."
                rows="4"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>
          </div>

          {/* ================= SUBMIT ================= */}
          <button
            type="submit"
            className={`submit-column ${loading ? "btn-loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="loader-dots">Analysing Idea...</span>
            ) : (
              "🚀 GENERATE FEASIBILITY REPORT"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IdeaSubmission;