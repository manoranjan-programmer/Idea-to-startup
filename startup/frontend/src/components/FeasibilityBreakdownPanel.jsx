import React from "react";

/**
 * Helper to determine score color
 */
function getColor(value) {
  if (value >= 70) return "#22c55e"; // Green
  if (value >= 40) return "#eab308"; // Yellow
  return "#ef4444"; // Red
}

export default function FeasibilityBreakdownPanel({
  activeMetric,
  setActiveMetric,
  technicalScore = 0,
  marketScore = 0,
  researchScore = 0,
  innovationScore = 0,
  metricAnalyses = {},
}) {
  const metrics = [
    { key: "technical", label: "Technical Feasibility", score: technicalScore },
    { key: "market", label: "Market Feasibility", score: marketScore },
    { key: "research", label: "Research Readiness", score: researchScore },
    { key: "innovation", label: "Innovation Potential", score: innovationScore },
  ];

  return (
    <section
      className="panel breakdown-panel"
      style={{
        background: "#020617",
        padding: "18px",
        borderRadius: "14px",
      }}
    >
      <h3
        className="section-title"
        style={{
          color: "#f8fafc",
          fontWeight: 600,
          marginBottom: "16px",
        }}
      >
        Feasibility Breakdown
      </h3>

      <div className="breakdown-grid">
        {metrics.map((metric) => {
          const color = getColor(metric.score);
          const isActive = activeMetric === metric.key;

          return (
            <div
              key={metric.key}
              onClick={() => setActiveMetric(metric.key)}
              style={{
                cursor: "pointer",
                padding: "14px",
                borderRadius: "12px",
                border: `1px solid #1e293b`,
                borderLeft: `4px solid ${color}`,
                marginBottom: "14px",
                transition: "all 0.25s ease",
                backgroundColor: isActive ? "#020617" : "#020617",
                boxShadow: isActive
                  ? "0 0 0 1px #334155"
                  : "none",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "#e5e7eb",
                  }}
                >
                  {metric.label}
                </span>

                <span
                  style={{
                    fontWeight: 700,
                    color,
                  }}
                >
                  {metric.score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: "6px",
                  background: "#0f172a",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: `${metric.score}%`,
                    height: "100%",
                    background: color,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>

              {/* Analysis (Always Visible) */}
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#cbd5f5",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {metricAnalyses?.[metric.key] ||
                  "No analysis available for this metric."}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
