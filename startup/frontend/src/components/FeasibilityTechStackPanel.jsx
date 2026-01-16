import React from "react";
import {
  FaLayerGroup,
  FaCode,
  FaServer,
  FaDatabase,
  FaCloud
} from "react-icons/fa";
import "../styles/FeasibilityTechStackPanel.css";

export default function FeasibilityTechStackPanel({ techStackData }) {
  const stack = [
    {
      category: "Frontend",
      icon: <FaCode />,
      tools: techStackData?.frontend || [
        "React.js",
        "Tailwind CSS",
        "TypeScript"
      ]
    },
    {
      category: "Backend",
      icon: <FaServer />,
      tools: techStackData?.backend || [
        "Node.js",
        "Express.js",
        "FastAPI"
      ]
    },
    {
      category: "Database",
      icon: <FaDatabase />,
      tools: techStackData?.database || [
        "PostgreSQL",
        "Redis",
        "MongoDB"
      ]
    },
    {
      category: "Infrastructure",
      icon: <FaCloud />,
      tools: techStackData?.infrastructure || [
        "AWS",
        "Docker",
        "Vercel"
      ]
    }
  ];

  return (
    <section className="techstack-wrapper">
      <div className="techstack-card">
        <header className="techstack-header">
          <h2>
            <FaLayerGroup /> Recommended Tech Stack
          </h2>
          <p>AI-generated architecture based on your project requirements.</p>
        </header>

        <div className="techstack-grid">
          {stack.map((item, index) => (
            <div className="techstack-box" key={index}>
              <div className="techstack-title">
                {item.icon}
                <span>{item.category}</span>
              </div>

              <ul>
                {item.tools.map((tool, i) => (
                  <li key={i}>{tool}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
