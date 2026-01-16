export default function FeasibilitySummaryPanel({
  idea,
  aiSummary,
  futureScope,
}) {
  return (
    <section className="panel panel-wide">
      <h4 className="section-title">Startup Idea</h4>
      <p className="result-text">{idea}</p>

      <div className="panel-split">
        <div>
          <h4 className="section-title">AI Analysis</h4>
          <p className="result-text">{aiSummary}</p>
        </div>
        <div>
          <h4 className="section-title">Future Scope</h4>
          <ul className="result-list">
            {futureScope.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
