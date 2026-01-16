import React from "react";
import "../styles/FeasibilityReport.css";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v || 0)));

/* ================= MAIN COMPONENT ================= */
export default function FeasibilityPDFTemplate({
  idea = "Startup Idea",
  aiSummary = "AI feasibility summary not available.",
  shortDescription = "",
  feasibilityScore = 0,
  technicalScore = 0,
  marketScore = 0,
  researchScore = 0,
  innovationScore = 0,
  strengths = [],
  risks = [],
  actions = [],
  metricAnalyses = {},
  techStackData = {},
}) {
  const scores = {
    fea: clamp(feasibilityScore),
    te: clamp(technicalScore),
    ma: clamp(marketScore),
    re: clamp(researchScore),
    inn: clamp(innovationScore),
  };

  /* ================= CHART DATA ================= */
  const donutData = {
    datasets: [
      {
        data: [scores.fea, 100 - scores.fea],
        backgroundColor: ["#2e7d32", "#e0e0e0"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ["Technical", "Market", "Research", "Innovation"],
    datasets: [
      {
        data: [scores.te, scores.ma, scores.re, scores.inn],
        backgroundColor: ["#1976d2", "#ef6c00", "#7b1fa2", "#c62828"],
        borderRadius: 6,
        barThickness: 100,
      },
    ],
  };

  const feasibilityLineData = {
    labels: ["Technical", "Market", "Research", "Innovation", "Final Score"],
    datasets: [
      {
        label: "Feasibility Progress",
        data: [scores.te, scores.ma, scores.re, scores.inn, scores.fea],
        borderColor: "#1a237e",
        backgroundColor: "rgba(26,35,126,0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#1a237e",
      },
    ],
  };

  /* ================= RENDER TECH STACK ================= */
  const renderTechStack = (stack) => {
    if (!stack || Object.keys(stack).length === 0) {
      return <p style={{ color: "#111" }}>Tech stack data not available.</p>;
    }

    return (
      <div className="tech-stack-pdf">
        {Object.entries(stack).map(([category, tools]) => (
          <div key={category} className="tech-stack-item">
            <strong>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </strong>
            <span>{tools && tools.length ? tools.join(", ") : "N/A"}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pdf-container">
      {/* ================= PAGE 1 ================= */}
      <div className="pdf-page">
        <img src="/feasibility-template.png" className="pdf-bg-img" alt="Background" />
        <div className="pdf-content">
          <div className="pdf-header-flex">
            <div className="text-box">
              <h1 className="report-main-title">Feasibility Analysis Report</h1>
              <p className="report-sub-title">
                Generated Technical and Market Assessment
              </p>
            </div>

            <div className="donut-stat-box">
              <Doughnut
                data={donutData}
                options={{
                  cutout: "72%",
                  plugins: { legend: false },
                  maintainAspectRatio: false,
                  animation: false,
                }}
              />
              <div className="donut-center-text">
                <span className="score-val">{scores.fea}</span>
                <span className="score-max">/100</span>
              </div>
            </div>
          </div>

          <section className="dashboard-section chart-container">
            <h3 className="section-title">Feasibility Score Breakdown</h3>
            <div className="bar-wrapper">
              <Bar
                data={barData}
                options={{
                  plugins: { legend: false },
                  scales: {
                    y: { beginAtZero: true, max: 100 },
                    x: { grid: { display: false } },
                  },
                  maintainAspectRatio: false,
                  animation: false,
                }}
              />
            </div>
          </section>

          <section className="dashboard-section idea-overview">
            <h3 className="section-title">Startup Idea Overview</h3>
            <h2 className="display-idea-name">{idea}</h2>
            <p className="display-summary">{aiSummary}</p>
          </section>

          {shortDescription && (
            <section className="dashboard-section short-description">
              <h3 className="section-title">Short Description</h3>
              <p className="display-summary">{shortDescription}</p>
            </section>
          )}

          <section className="dashboard-section feasibility-progress">
            <h3 className="section-title">
              Feasibility Score Progress Analysis
            </h3>

            <div style={{ height: "160px" }}>
              <Line
                data={feasibilityLineData}
                options={{
                  plugins: { legend: false },
                  scales: {
                    y: { beginAtZero: true, max: 100 },
                    x: { grid: { display: false } },
                  },
                  maintainAspectRatio: false,
                  animation: false,
                }}
              />
            </div>

            <p className="display-summary" style={{ marginTop: "10px" }}>
              This progression illustrates how individual evaluation dimensions
              collectively contribute to the final feasibility score.
            </p>
          </section>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="pdf-page">
        <img src="/feasibility-template.png" className="pdf-bg-img" alt="Background" />
        <div className="pdf-content">
          <div className="insights-card-grid">
            <InsightList title="Key Strengths" items={strengths} theme="green" />
            <InsightList title="Primary Risks" items={risks} theme="orange" />
            <InsightList
              title="Recommended Actions"
              items={actions}
              theme="blue"
            />
          </div>

          <section className="detailed-text-section">
            <h3 className="detailed-header">DETAILED ANALYSIS</h3>
            <div className="analysis-grid">
              <div className="analysis-item">
                <strong>Technical:</strong>{" "}
                {metricAnalyses.technical || "N/A"}
              </div>
              <div className="analysis-item">
                <strong>Market:</strong> {metricAnalyses.market || "N/A"}
              </div>
              <div className="analysis-item">
                <strong>Research:</strong> {metricAnalyses.research || "N/A"}
              </div>
              <div className="analysis-item">
                <strong>Innovation:</strong>{" "}
                {metricAnalyses.innovation || "N/A"}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ================= PAGE 3 ================= */}
      <div className="pdf-page">
        <img src="/feasibility-template.png" className="pdf-bg-img" alt="bg" />
        <div className="pdf-content">
          <section className="detailed-text-section">
            <h3 className="detailed-header">RECOMMENDED TECH STACK</h3>
            {renderTechStack(techStackData)}
          </section>

          <footer className="footer-copyright" style={{ marginTop: "30px" }}>
            Generated by AI Feasibility Predictor ·{" "}
            {new Date().toLocaleDateString("en-IN")}
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ================= INSIGHT CARD ================= */
function InsightList({ title, items, theme }) {
  const content = items?.length ? items.slice(0, 4) : ["Data not available"];
  return (
    <div className={`insight-card-item theme-${theme}`}>
      <h4>{title}</h4>
      <ul>
        {content.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </div>
  );
}
