import React from "react";

const DeepAnalysis = ({ deepRef, detailedAnalysis, idea }) => {
  // Function to clean the idea for Google Scholar search
  const getCleanSearchQuery = () => {
    if (!idea || idea.trim() === "") return "";
    let coreConcept = idea.split(/[.!?]/)[0];
    const bridgeWords = [" because", " to solve", " due to", " for ", " which", " aimed at"];
    bridgeWords.forEach(word => {
      if (coreConcept.toLowerCase().includes(word)) {
        coreConcept = coreConcept.split(new RegExp(word, "i"))[0];
      }
    });
    const trimmed = coreConcept.trim();
    const words = trimmed.split(/\s+/);
    return words.length > 7 ? words.slice(0, 7).join(" ") : trimmed;
  };

  return (
    <section ref={deepRef} className="section-block">
      <div
        className="deep-analysis-layout"
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}
      >
        {/* LEFT: AI Business Analysis */}
        <div
          className="panel deep-panel"
          style={{
            background: "#020617",
            borderRadius: "14px",
            padding: "18px",
            border: "1px solid #1e293b",
          }}
        >
          <h4
            className="section-title"
            style={{ color: "#f8fafc", marginBottom: "12px" }}
          >
            Deeper Business Analysis (AI)
          </h4>

          {detailedAnalysis && detailedAnalysis.trim() !== "" ? (
            <p
              style={{
                color: "#cbd5f5",
                fontSize: "0.9rem",
                lineHeight: "1.6",
                whiteSpace: "pre-line",
              }}
            >
              {detailedAnalysis}
            </p>
          ) : (
            <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
              Failed to generate AI analysis.
            </p>
          )}
        </div>

        {/* RIGHT: Academic Validation */}
        <div className="panel research-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <h4 className="section-title">Academic Validation</h4>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px', opacity: 0.8 }}>
                  Search academic literature for your concept to validate methodology.
                </p>
                <button 
                  className="submit-column" 
                  style={{ width: '80%', padding: '12px' }}
                  onClick={() => {
                    const cleanIdea = getCleanSearchQuery();
                    window.open('https://scholar.google.com/scholar?q=' + encodeURIComponent(cleanIdea), '_blank');
                  }}
                >
                  🔍 View Related Research
                </button>
              </div>
      </div>
    </section>
  );
};

export default DeepAnalysis;
