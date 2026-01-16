export default function FeasibilityKPIDashboard({
  activeMetric,
  feasibilityScore,
  marketTrends,
  strengths,
  risks,
  metricCopy,
  setActiveMetric,
}) {
  return (
    <section className="panel dashboard-card">
      <div className="dashboard-kpi-row">
        {/* Overall KPI circle */}
        <div className="circle-wrapper">
          <p className="circle-label">Overall Feasibility</p>
          <div className="circle-outer">
            <div
              className="circle-progress"
              onClick={() => setActiveMetric("overall")}
              style={{
                background: `conic-gradient(#3b82f6 ${
                  feasibilityScore * 3.6
                }deg, #0f172a ${feasibilityScore * 3.6}deg)`,
              }}
            >
              <div className="circle-inner">
                <span className="circle-score">{feasibilityScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market trends */}
        <div className="mini-chart">
          <p className="mini-chart-title">Market Trends</p>
          <ul className="mini-chart-list">
            {marketTrends.length === 0 && (
              <li className="mini-empty">No market trends provided</li>
            )}
            {marketTrends.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strengths / risks */}
      <div className="strength-weakness-row">
        <div>
          <p className="sw-title">Strengths</p>
          <ul className="sw-list">
            {strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="sw-title">Risks</p>
          <ul className="sw-list">
            {risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dashboard-caption">
        {metricCopy[activeMetric]}
      </div>
    </section>
  );
}
