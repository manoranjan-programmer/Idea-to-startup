import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadAndAnalyzeDocument } from "../services/feasibilityApi"; // <-- updated import
import "./UploadDocument.css";

const UploadDocument = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a TXT or PDF file.");
      return;
    }

    const allowedExtensions = [".txt", ".pdf"];
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setError("Only .txt and .pdf files are allowed.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // ✅ Use frontend API service to upload & analyze document
      const data = await uploadAndAnalyzeDocument(file);

      if (data) {
        navigate("/feasibility-result", { state: data });
      }
    } catch (err) {
      console.error("Upload / AI Feasibility error:", err);
      setError(err.message || "Failed to analyze document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">Upload Idea Document</h2>

        <p className="upload-subtitle">
          Upload your idea as a TXT or PDF document for AI feasibility analysis.
        </p>

        {/* File Input */}
        <input
          type="file"
          accept=".txt,.pdf"
          className="upload-input"
          disabled={loading}
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* Upload Button */}
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading & Analyzing..." : "Upload & Analyze"}
        </button>

        {error && <p className="upload-error">{error}</p>}
      </div>
    </div>
  );
};

export default UploadDocument;
