import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import "../styles/Feasibility.css";
import "../styles/FeasibilityReport.css";

import FeasibilitySummaryPanel from "../components/FeasibilitySummaryPanel";
import FeasibilityBreakdownPanel from "../components/FeasibilityBreakdownPanel";
import FeasibilityKPIDashboard from "../components/FeasibilityKPIDashboard";
import FeasibilityPDFTemplate from "../components/FeasibilityPDFTemplate";
import DeepAnalysis from "../components/DeepAnalysis";
import FeasibilityTechStackPanel from "../components/FeasibilityTechStackPanel";

export default function FeasibilityResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [activeMetric, setActiveMetric] = useState("technical");
  const [activeSection, setActiveSection] = useState("summary");

  const summaryRef = useRef(null);
  const breakdownRef = useRef(null);
  const kpiRef = useRef(null);
  const deepRef = useRef(null);
  const techStackRef = useRef(null);
  const pdfReportRef = useRef(null);

  /* ---------------- Load data ---------------- */
  useEffect(() => {
    if (location.state) {
      setData(location.state);
    }
  }, [location.state]);

  /* ---------------- Guard ---------------- */
  if (!data) {
    return (
      <div className="idea-container">
        <div className="idea-card">
          <h3 className="idea-title">No feasibility data found</h3>
          <button
            className="submit-column"
            onClick={() => navigate("/idea-text")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- Data Normalization ---------------- */
  const idea = data.idea || "Not provided";
  const feasibilityScore = Number(data.feasibilityScore) || 0;
  const technicalScore = Number(data.technicalScore || 0);
  const marketScore = Number(data.marketScore || 0);
  const researchScore = Number(data.researchScore || 0);
  const innovationScore = Number(data.innovationScore || 0);
  const aiSummary = data.aiSummary || "AI summary could not be generated.";

  const mappedAnalyses = {
    technical:
      data.metricAnalyses?.technical ||
      data.metricAnalyses?.technicalAnalysis ||
      "No technical analysis available.",
    market:
      data.metricAnalyses?.market ||
      data.metricAnalyses?.marketAnalysis ||
      "No market analysis available.",
    research:
      data.metricAnalyses?.research ||
      data.metricAnalyses?.researchAnalysis ||
      "No research analysis available.",
    innovation:
      data.metricAnalyses?.innovation ||
      data.metricAnalyses?.innovationJustification ||
      "No innovation analysis available.",
  };

  const strengths = Array.isArray(data.strengths) ? data.strengths : [];
  const risks = Array.isArray(data.risks) ? data.risks : [];
  const futureScope = Array.isArray(data.futureScope) ? data.futureScope : [];

  const metricCopy = {
    overall:
      "Overall feasibility score derived from technical, market, research, and innovation analysis.",
    technical: mappedAnalyses.technical,
    market: mappedAnalyses.market,
    research: mappedAnalyses.research,
    innovation: mappedAnalyses.innovation,
  };

  /* ---------------- Scroll Logic ---------------- */
  const scrollTo = (section) => {
    setActiveSection(section);
    const map = {
      summary: summaryRef,
      breakdown: breakdownRef,
      kpi: kpiRef,
      deep: deepRef,
      techStack: techStackRef,
    };
    map[section]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* ---------------- PDF Download Logic ---------------- */
  const downloadPDF = async () => {
    const reportElement = pdfReportRef.current;
    if (!reportElement) return;

    const button = document.querySelector(".download-pdf-btn");

    try {
      if (button) {
        button.textContent = "Generating...";
        button.disabled = true;
      }

      const pages = Array.from(
        reportElement.querySelectorAll(".pdf-page")
      );
      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save("feasibility_report.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      if (button) {
        button.textContent = "📥 Download PDF";
        button.disabled = false;
      }
    }
  };

  return (
    <div className="idea-container dashboard-mode">
      <div className="dashboard-shell">
        <nav className="dashboard-tabs">
          <div className="tabs-left">
            <h2 className="dashboard-tabs-title">
              Feasibility Dashboard
            </h2>
          </div>

          <div className="tabs-right">
            {["summary", "breakdown", "kpi", "deep", "techStack"].map(
              (sec) => (
                <button
                  key={sec}
                  className={`tab-chip ${
                    activeSection === sec ? "tab-chip-active" : ""
                  }`}
                  onClick={() => scrollTo(sec)}
                >
                  {sec === "techStack"
                    ? "Tech Stack"
                    : sec.charAt(0).toUpperCase() + sec.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="tabs-actions">
            

            <button
              className="submit-column download-pdf-btn"
              onClick={downloadPDF}
            >
              📥 Download PDF
            </button>

            <button
              className="submit-column"
              onClick={() => navigate("/select-idea")}
            >
              New Idea
            </button>
          </div>
        </nav>

        <section ref={summaryRef} className="section-block">
          <FeasibilitySummaryPanel
            idea={idea}
            aiSummary={aiSummary}
            futureScope={futureScope}
          />
        </section>

        <section ref={breakdownRef} className="section-block">
          <FeasibilityBreakdownPanel
            activeMetric={activeMetric}
            setActiveMetric={setActiveMetric}
            technicalScore={technicalScore}
            marketScore={marketScore}
            researchScore={researchScore}
            innovationScore={innovationScore}
            metricAnalyses={mappedAnalyses}
          />
        </section>

        <section ref={kpiRef} className="section-block">
          <FeasibilityKPIDashboard
            activeMetric={activeMetric}
            feasibilityScore={feasibilityScore}
            marketTrends={data.marketTrends || []}
            strengths={strengths}
            risks={risks}
            metricCopy={metricCopy}
            setActiveMetric={setActiveMetric}
          />
        </section>

        <DeepAnalysis
          deepRef={deepRef}
          detailedAnalysis={data.detailedAnalysis}
          idea={idea}
        />

        <section ref={techStackRef} className="section-block">
          <FeasibilityTechStackPanel
            techStackData={data.techStackSuggestion}
          />
        </section>
      </div>

      {/* ---------------- PDF RENDER TARGET ---------------- */}
      <div
        ref={pdfReportRef}
        style={{ position: "absolute", left: "-9999px", width: "794px" }}
      >
        <FeasibilityPDFTemplate
          idea={idea}
          aiSummary={aiSummary}
          feasibilityScore={feasibilityScore}
          technicalScore={technicalScore}
          marketScore={marketScore}
          researchScore={researchScore}
          innovationScore={innovationScore}
          strengths={strengths}
          risks={risks}
          actions={futureScope}
          metricAnalyses={mappedAnalyses}
          techStackData={data.techStackSuggestion} 
        />
      </div>
    </div>
  );
}
