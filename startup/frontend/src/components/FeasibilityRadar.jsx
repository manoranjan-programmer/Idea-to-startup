import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

/* ===============================
   Register ChartJS components
================================ */
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/* ===============================
   Helper: clamp value (0–100)
================================ */
const clamp = (value) => Math.max(0, Math.min(100, value));

export default function FeasibilityRadar({ score }) {
  const radarData = {
    labels: [
      "Market Demand",
      "Technical Feasibility",
      "Scalability",
      "Competition",
      "Revenue Potential",
    ],
    datasets: [
      {
        label: "Feasibility Metrics",
        data: [
          clamp(score + 5),
          clamp(score),
          clamp(score - 5),
          clamp(score - 10),
          clamp(score + 3),
        ],
        backgroundColor: "rgba(59, 130, 246, 0.25)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div style={{ maxWidth: "450px", margin: "0 auto" }}>
      <Radar data={radarData} options={radarOptions} />
    </div>
  );
}
