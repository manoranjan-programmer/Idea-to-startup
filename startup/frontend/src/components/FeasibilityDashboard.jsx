import "../styles/FeasibilityDashboard.css";

export default function FeasibilityDashboard({ workforce }) {
  // Use safe defaults to prevent blank page
  const safeWorkforce = {
    country: workforce?.country || "Not Specified",
    employeesRequired: Number(workforce?.employeesRequired) || 0,
    salaryPerEmployee: Number(workforce?.salaryPerEmployee) || 0,
    totalSalaryCost: Number(workforce?.totalSalaryCost) || 0,
    totalBudget: Number(workforce?.totalBudget) || 0,
    budgetUtilizationPercent: Number(workforce?.budgetUtilizationPercent) || 0,
  };

  const {
    country,
    employeesRequired,
    salaryPerEmployee,
    totalSalaryCost,
    totalBudget,
    budgetUtilizationPercent,
  } = safeWorkforce;

  return (
    <div className="panel panel-wide">
      <h3 className="section-title">Workforce & Cost Analysis</h3>

      <div className="vertical-breakdown">
        <p className="result-text">
          🌍 <strong>Operating Country:</strong> {country}
        </p>

        <p className="result-text">
          👥 <strong>Employees Required:</strong> {employeesRequired}
        </p>

        <p className="result-text">
          💵 <strong>Salary / Employee (Monthly):</strong> $
          {salaryPerEmployee.toLocaleString()}
        </p>

        <p className="result-text">
          💸 <strong>Total Salary Cost (Monthly):</strong> $
          {totalSalaryCost.toLocaleString()}
        </p>

        <p className="result-text">
          💰 <strong>Total Budget:</strong> ${totalBudget.toLocaleString()}
        </p>

        {/* Budget Utilization Bar */}
        <div>
          <div className="breakdown-label-wrap">
            <span>Budget Utilization</span>
            <span>{budgetUtilizationPercent}%</span>
          </div>
          <div className="breakdown-bar-track">
            <div
              className="breakdown-bar-fill"
              style={{
                width: `${budgetUtilizationPercent}%`,
                background:
                  budgetUtilizationPercent <= 60
                    ? "#22c55e"
                    : budgetUtilizationPercent <= 85
                    ? "#facc15"
                    : "#ef4444",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
