import React from "react";

function JobCard({ job, appliedJobs, onApply, onDetails }) {
  const status = appliedJobs[job._id];
  const isApplied = !!status;
  const isDeadlinePassed = job.deadline && new Date() > new Date(job.deadline);

  return (
    <div style={cardStyle}>
      <h3 style={title}>{job.title}</h3>

      <p><b style={label}>Company:</b> {job.company}</p>
      <p><b style={label}>Location:</b> {job.location}</p>
      {job.deadline && (
        <p>
          <b style={label}>Deadline: </b>
          <span style={{ color: isDeadlinePassed ? "#ef4444" : "#475569", fontWeight: "600" }}>
            {new Date(job.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            {isDeadlinePassed && " (Closed)"}
          </span>
        </p>
      )}

      {/* DESCRIPTION */}
      <div>
        <p style={sectionTitle}>Description</p>
        <p style={desc}>{job.description}</p>
      </div>

      {job.matchReason && (
        <div style={aiMatchBox}>
          <div style={aiMatchHeader}>
            <span style={{ fontSize: "16px" }}>✨</span>
            <strong>AI Match Insight</strong>
          </div>
          <p style={aiMatchText}>
            {job.matchReason}
          </p>
        </div>
      )}


      {/* TECH STACK */}
      <div style={techWrapper}>
        <p style={sectionTitle}>Tech Stack</p>
        <div style={techContainer}>
          {job.technologyStack
            ?.filter((tech) => tech && tech.trim() !== "") // ✅ remove empty
            .map((tech, i) => (
              <span key={i} style={tagStyle}>{tech}</span>
          ))}
        </div>
      </div>

      {/* BUTTONS */}
      <div style={btnContainer}>
        {isDeadlinePassed && !isApplied ? (
          <button disabled style={expiredBtn}>
            Closed
          </button>
        ) : (
          <button
            disabled={isApplied}
            style={isApplied ? statusBtn(status) : applyBtn}
            onClick={() => onApply(job)}
          >
            {isApplied ? status.toUpperCase() : "Apply"}
          </button>
        )}

        <button style={detailsBtn} onClick={() => onDetails(job)}>
          Details
        </button>
      </div>
    </div>
  );
}

/* STYLES */

const cardStyle = {
  background: "var(--card-bg)",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "var(--shadow)",
  border: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  width: "100%",
  maxWidth: "380px",
  boxSizing: "border-box",
  color: "var(--card-text)",
};

const title = {
  color: "var(--card-text)",
  fontSize: "22px",
  fontWeight: "700",
};

const label = {
  color: "var(--card-muted)",
};

const sectionTitle = {
  fontWeight: "700",
  color: "var(--text-h)",
  marginBottom: "5px",
};

const desc = {
  color: "var(--card-desc)",
  fontSize: "14px",
  lineHeight: "1.6",
};

const techWrapper = {
  marginTop: "5px",
};

const techContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const tagStyle = {
  padding: "8px 14px",
  background: "var(--tag-bg)",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "500",
  color: "var(--tag-text)",
};

const btnContainer = {
  marginTop: "15px",
  display: "flex",
  gap: "15px",
};

const applyBtn = {
  background: "var(--auth-btn-bg)",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
};

const statusBtn = (status) => {
  let bg = "#94a3b8";
  if (status === "accepted") bg = "#22c55e";
  if (status === "rejected") bg = "#ef4444";

  return {
    background: bg,
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "not-allowed",
    fontWeight: "600",
  };
};

const detailsBtn = {
  background: "var(--btn-secondary-bg)",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
};

const aiMatchBox = {
  background: "var(--surface-muted)",
  borderLeft: "4px solid var(--accent)",
  padding: "15px",
  borderRadius: "0 8px 8px 0",
  marginTop: "15px",
  boxShadow: "var(--shadow)",
};

const aiMatchHeader = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "var(--accent)",
  marginBottom: "6px",
  fontSize: "14px",
};

const aiMatchText = {
  margin: 0,
  fontSize: "14px",
  color: "var(--card-desc)",
  lineHeight: "1.6",
};

const expiredBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "10px",
  cursor: "not-allowed",
  fontWeight: "600",
  opacity: 0.8,
};

export default JobCard;