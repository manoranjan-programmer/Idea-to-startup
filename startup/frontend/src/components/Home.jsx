import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const HeroSection = ({ isAuth }) => { // Receive isAuth from parent
  const lineRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const line = lineRef.current;
    if (line) {
      const length = line.getTotalLength();
      line.style.setProperty("--line-length", length);
    }
  }, []);

  // ================= HANDLE GET STARTED =================
  const handleGetStarted = () => {
    if (isAuth) {
      navigate("/select-idea"); // logged in → go to selection
    } else {
      navigate("/login"); // not logged in → go to login
    }
  };

  // ✅ About button click
  const handleAboutClick = () => {
    navigate("/#about");
  };

  return (
    <div className="hero-root">
      
      {/* ✅ TOP RIGHT ABOUT BUTTON */}
      <button className="about-btn" onClick={handleAboutClick}>
        About
      </button>

      <svg
        className="hero-svg"
        viewBox="0 0 1366 768"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#050819" />
            <stop offset="50%" stopColor="#050b25" />
            <stop offset="100%" stopColor="#020b20" />
          </linearGradient>

          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e547f" />
            <stop offset="50%" stopColor="#0b3f63" />
            <stop offset="100%" stopColor="#06263f" />
          </linearGradient>

          <linearGradient id="buttonGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#24b2ff" />
            <stop offset="100%" stopColor="#1d83ff" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1366" height="768" fill="url(#bgGradient)" />

        {/* grid */}
        <g className="grid-lines">
          {[130, 230, 330, 430, 530, 630].map((y) => (
            <line
              key={`major-${y}`}
              x1="0"
              y1={y}
              x2="1366"
              y2={y}
              stroke="#20334a"
              strokeWidth="1"
            />
          ))}
          {[180, 280, 380, 480, 580].map((y) => (
            <line
              key={`minor-${y}`}
              x1="0"
              y1={y}
              x2="1366"
              y2={y}
              stroke="#20334a"
              strokeWidth="0.6"
              opacity="0.4"
            />
          ))}
        </g>

        {/* bars */}
        <g className="bars-group">
          <rect className="bar bar-1" x="120" y="240" width="230" height="410" rx="30" ry="30" fill="url(#barGradient)" />
          <rect className="bar bar-2" x="415" y="180" width="220" height="470" rx="30" ry="30" fill="url(#barGradient)" />
          <rect className="bar bar-3" x="705" y="215" width="230" height="435" rx="30" ry="30" fill="url(#barGradient)" />
          <rect className="bar bar-4" x="1005" y="90" width="240" height="560" rx="30" ry="30" fill="url(#barGradient)" />
        </g>

        {/* line + dots */}
        <g className="line-group">
          <path
            ref={lineRef}
            className="line-path"
            d="M185 425 L470 360 L760 385 L1045 245 L1195 235"
            fill="none"
            stroke="#5fe3ff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.75"
          />
          <g className="line-dots">
            {[185, 470, 760, 1045, 1195].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={[425, 360, 385, 245, 235][i]}
                r="7"
                fill="#5fe3ff"
                opacity="0.9"
              />
            ))}
          </g>
        </g>

        {/* title */}
        <g className="title-group">
          <text className="title-line title-top" x="683" y="310" textAnchor="middle">
            IDEA-TO-STARTUP
          </text>
          <text className="title-line title-bottom" x="683" y="384" textAnchor="middle">
            FEASIBILITY PREDICTOR
          </text>
        </g>

        {/* Get Started button */}
        <g
          className="button-group"
          transform="translate(0, 40)"
          onClick={handleGetStarted}
          style={{ cursor: "pointer" }}
        >
          <rect
            className="button-bg"
            x="583"
            y="410"
            width="200"
            height="72"
            rx="36"
            ry="36"
            fill="url(#buttonGradient)"
          />
          <text className="button-text" x="683" y="455" textAnchor="middle">
            Get Started
          </text>
        </g>
      </svg>
    </div>
  );
};

export default HeroSection;
