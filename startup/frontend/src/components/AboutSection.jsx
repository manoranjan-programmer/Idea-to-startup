import React, { useEffect, useRef, useState } from "react";
import "./AboutSection.css";

const AboutSection = () => {
  const sectionRef = useRef(null);
  const [visibleStates, setVisibleStates] = useState([false, false, false]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll(".about-card"));

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleStates((prev) => {
          const next = [...prev];
          entries.forEach((entry) => {
            const index = cards.indexOf(entry.target);
            if (index !== -1) {
              next[index] = entry.isIntersecting;
            }
          });
          return next;
        });
      },
      { threshold: 0.3 }
    );

    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="about-wrapper" ref={sectionRef} id="about">
      <div className="about-inner">
        <h2 className="about-title">
          <span className="about-title-gradient">About</span>{" "}
          <span className="about-title-accent">Us</span>
        </h2>

        <p className="about-subtitle">
          Turning ideas into validated, market-ready startup opportunities using
          data-driven intelligence.
        </p>

        <div className="about-card-container">
          <div
            className={
              "about-card" +
              (visibleStates[0] ? " about-card-visible delay-1" : "")
            }
          >
            <h3 className="about-card-heading">
              Idea Validation & Risk Assessment
            </h3>
            <p className="about-card-text">
              Evaluates market demand, competition, and problem relevance to
              uncover early risks and feasibility gaps before execution.
            </p>
          </div>

          <div
            className={
              "about-card" +
              (visibleStates[1] ? " about-card-visible delay-2" : "")
            }
          >
            <h3 className="about-card-heading">
              Data-Driven Feasibility Scoring
            </h3>
            <p className="about-card-text">
              Uses AI and historical startup data to generate a clear feasibility
              score across market, technology, and revenue factors.
            </p>
          </div>

          <div
            className={
              "about-card" +
              (visibleStates[2] ? " about-card-visible delay-3" : "")
            }
          >
            <h3 className="about-card-heading">
              Actionable Improvement Insights
            </h3>
            <p className="about-card-text">
              Delivers practical recommendations to refine positioning,
              strengthen differentiation, and improve success probability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
