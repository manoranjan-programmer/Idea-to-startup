import React, { useState } from 'react';
import { analyzeIdea } from '../services/feasibilityApi'; // Adjust path to where your feasibilityApi.js is located
import FeasibilityBreakdownPanel from './FeasibilityBreakdownPanel';

export default function IdeaAnalyzer() {
  // 1. Form State
  const [problemStatement, setProblemStatement] = useState('');
  const [idea, setIdea] = useState('');
  const [domain, setDomain] = useState(''); 
  
  // 2. Analysis Data State
  const [feasibilityData, setFeasibilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState('technical');

  /**
   * Logic using the shared API utility
   */
  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!problemStatement.trim() || !idea.trim()) {
      alert('Please fill in both the problem and the idea');
      return;
    }

    setLoading(true);
    setFeasibilityData(null); // Clear previous results for a fresh start

    try {
      // Use the function from your api calling file
      const result = await analyzeIdea({
        idea: idea.trim(),
        problemStatement: problemStatement.trim(),
        market: domain || "General",
        budget: "Not specified",
        useAI: true
      });

      // Your feasibilityApi.js returns res.data, which is { success: true, data: { ... } }
      if (result.success && result.data) {
        setFeasibilityData(result.data);
      } else {
        throw new Error("No analysis data returned from the server.");
      }

    } catch (error) {
      console.error('❌ AI Analysis Error:', error);
      // Show the message from your backend if available
      alert(error.message || 'Failed to analyze feasibility. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="idea-analyzer-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <div className="panel idea-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h2 className="idea-title" style={{ marginBottom: '10px', color: '#333' }}>AI Feasibility Analyzer</h2>
        <p style={{ color: '#666', marginBottom: '25px' }}>Get instant insights into your startup's potential using OpenAI.</p>
        
        <form onSubmit={handleAnalyze} className="idea-form">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Your Startup Idea</label>
            <textarea
              className="form-control"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A marketplace for recycled textile materials..."
              rows="3"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '16px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Problem Statement</label>
            <textarea
              className="form-control"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="What specific pain point are you solving?"
              rows="3"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '16px' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: loading ? '#a5a5a5' : '#4F46E5', 
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease'
            }}
          >
            {loading ? '🔍 Running AI Analysis...' : '🚀 Analyze Feasibility'}
          </button>
        </form>
      </div>

      {/* Results Section - Rendered only when data is received */}
      {feasibilityData && (
        <div className="results-section" style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#111827' }}>Analysis Breakdown</h3>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Powered by OpenAI</span>
          </div>
          
          <FeasibilityBreakdownPanel
            activeMetric={activeMetric}
            setActiveMetric={setActiveMetric}
            technicalScore={feasibilityData.technicalScore || 0}
            marketScore={feasibilityData.marketScore || 0}
            researchScore={feasibilityData.researchScore || 0}
            innovationScore={feasibilityData.innovationScore || 0}
            metricAnalyses={{
                technical: feasibilityData.metricAnalyses?.technical,
                market: feasibilityData.metricAnalyses?.market,
                research: feasibilityData.metricAnalyses?.research,
                innovation: feasibilityData.metricAnalyses?.innovation,
            }}
          />
        </div>
      )}
    </div>
  );
}