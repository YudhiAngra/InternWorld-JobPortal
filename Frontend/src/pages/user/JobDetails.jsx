import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../../config";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/jobs/${id}`)
      .then((res) => res.json())
      .then(setJob)
      .catch(() => toast.error("Failed to load job"));
  }, [id]);

  useEffect(() => {
    fetch(`${API_URL}/user/applied-jobs`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((app) => app.jobId === id);
        if (found) setStatus(found.status);
      })
      .catch(() => {});
  }, [id]);

  const handleApply = async () => {
    const isDeadlinePassed = job && job.deadline && new Date() > new Date(job.deadline);
    if (isDeadlinePassed) { toast.error("Application deadline has passed ❌"); return; }
    if (!coverLetter.trim()) { toast.error("Cover letter required ❌"); return; }
    if (coverLetter.trim().length < 20) { toast.error("Minimum 20 characters required ❌"); return; }
    if (resumeFile && resumeFile.type !== "application/pdf") { toast.error("Resume must be a PDF file ❌"); return; }

    try {
      const formData = new FormData();
      formData.append("coverLetter", coverLetter);
      if (resumeFile) formData.append("resume", resumeFile);

      const res = await fetch(`${API_URL}/jobs/apply/${id}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Applied 🚀");
        setStatus("applied");
      } else {
        toast.error(data.error || "Application failed ❌");
      }
    } catch {
      toast.error("Error ❌");
    }
  };

  if (!job) return <p style={{ padding: "40px", color: "#111" }}>Loading...</p>;

  const isDeadlinePassed = job.deadline && new Date() > new Date(job.deadline);

  return (
    <div style={container}>
      <div style={left}>
        <h1 style={title}>{job.title}</h1>
        <p style={meta}>{job.company} • {job.location}</p>
        <p style={salary}><b>Salary:</b> ₹{job.salary || "Not disclosed"}</p>

        {job.deadline && (
          <p style={deadlineStyle(isDeadlinePassed)}>
            <b>Application Deadline:</b>{" "}
            {new Date(job.deadline).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            {isDeadlinePassed && <span style={expiredBadge}>Expired</span>}
          </p>
        )}

        <div style={section}>
          <h3>Description</h3>
          <p style={desc}>{job.description}</p>
        </div>

        <div style={section}>
          <h3>Tech Stack</h3>
          <div style={techContainer}>
            {Array.isArray(job.technologyStack) ? (
              job.technologyStack.filter((t) => t && t.trim() !== "").map((t, i) => <span key={i} style={tag}>{t}</span>)
            ) : typeof job.technologyStack === "string" ? (
              job.technologyStack.split(",").map((t) => t.trim()).filter((t) => t !== "").map((t, i) => <span key={i} style={tag}>{t}</span>)
            ) : (
              <span style={tag}>N/A</span>
            )}
          </div>
        </div>
      </div>

      <div style={right}>
        <h3 style={{ marginBottom: "10px", color: "#111" }}>Apply for this job</h3>

        <textarea
          style={textarea}
          placeholder={isDeadlinePassed ? "Applications closed as deadline has passed." : "Write your cover letter (min. 20 characters)..."}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          disabled={!!status || isDeadlinePassed}
        />

        {!isDeadlinePassed && !status && (
          <div style={uploadBox}>
            <label style={uploadLabel} htmlFor="resume-upload">📎 Resume (PDF, optional)</label>
            <input id="resume-upload" type="file" accept="application/pdf" style={fileInput} onChange={(e) => setResumeFile(e.target.files[0] || null)} />
            {resumeFile && <p style={fileNameText}>✅ {resumeFile.name}</p>}
          </div>
        )}

        <button
          style={isDeadlinePassed ? expiredBtn : (status ? statusBtn(status) : applyBtn)}
          onClick={handleApply}
          disabled={!!status || isDeadlinePassed}
        >
          {isDeadlinePassed ? "Deadline Passed" : (status ? status.toUpperCase() : "Apply Now")}
        </button>
      </div>
    </div>
  );
}

const container = { 
  display: "flex", 
  gap: "30px", 
  padding: "40px", 
  background: "#f1f3f5", 
  minHeight: "calc(100vh - 70px)", 
  flexWrap: "wrap", 
  alignItems: "flex-start" 
};
const left = { 
  flex: 3, 
  minWidth: "300px", 
  background: "#ffffff", 
  padding: "25px", 
  borderRadius: "14px", 
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)", 
  color: "#111827" 
};
const right = { 
  flex: 1, 
  minWidth: "260px", 
  background: "#ffffff", 
  padding: "20px", 
  borderRadius: "14px", 
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)", 
  display: "flex", flexDirection: "column", 
  gap: "12px" 
};
const title = { 
  fontSize: "26px", 
  fontWeight: "700", 
  marginBottom: "10px", 
  color: "#111827" 
};
const meta = { 
  color: "#374151", 
  marginBottom: "10px" 
};
const salary = { 
  marginBottom: "20px" 
};
const section = { 
  marginTop: "20px" };
const desc = { 
  lineHeight: "1.6", 
  color: "#1f2937" 
};
const techContainer = { 
  display: "flex", 
  flexWrap: "wrap", 
  gap: "8px" 
};
const tag = { 
  padding: "6px 12px", 
  background: "#e0e7ff", 
  borderRadius: "20px", 
  fontSize: "12px", 
  color: "#000", 
  fontWeight: "500" 
};
const textarea = { 
  width: "100%", 
  boxSizing: "border-box", 
  height: "120px", 
  padding: "12px", 
  borderRadius: "10px", 
  border: "1px solid #d1d5db", 
  background: "#ffffff", 
  color: "#111827", 
  outline: "none", 
  resize: "none" 
};
const uploadBox = { 
  background: "#f8fafc", 
  border: "1.5px dashed #a5b4fc", 
  borderRadius: "10px", 
  padding: "14px 16px", 
  display: "flex", 
  flexDirection: "column", 
  gap: "8px" 
};
const uploadLabel = { 
  fontSize: "13px", 
  fontWeight: "600", 
  color: "#374151", 
  marginBottom: "4px" 
};
const fileInput = { 
  display: "block", 
  width: "100%", 
  fontSize: "13px", 
  color: "#374151", 
  cursor: "pointer" 
};
const fileNameText = { 
  fontSize: "12px", 
  color: "#16a34a", 
  fontWeight: "500", 
  margin: 0 
};
const applyBtn = { 
  background: "#0b132b", 
  color: "#fff", 
  border: "none", 
  padding: "12px", 
  borderRadius: "10px", 
  fontWeight: "600", 
  cursor: "pointer" 
};
const statusBtn = (status) => {
  let bg = "#64748b";
  if (status === "accepted") bg = "#22c55e";
  if (status === "rejected") bg = "#ef4444";
  return { 
    background: bg, 
    color: "#fff", 
    border: "none", 
    padding: "12px", 
    borderRadius: "10px", 
    fontWeight: "600", 
    cursor: "not-allowed" 
  };
};
const deadlineStyle = (isExpired) => ({ 
  marginBottom: "20px", 
  color: isExpired ? "#ef4444" : "#1f2937" 
});
const expiredBadge = { 
  background: "#ef4444", 
  color: "#fff", 
  padding: "2px 8px", 
  borderRadius: "12px", 
  fontSize: "12px", 
  marginLeft: "8px", 
  fontWeight: "bold", 
  display: "inline-block" 
};
const expiredBtn = { 
  background: "#ef4444", 
  color: "#fff", 
  border: "none", 
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "not-allowed",
  opacity: 0.8 
};

export default JobDetails;