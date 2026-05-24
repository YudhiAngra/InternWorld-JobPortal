import React, { useEffect, useState } from "react";
import "./employer-pages.css";
import { API_URL, SERVER_URL } from "../../config";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetch(`${API_URL}/employer/applications`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []));
  }, []);

  const updateStatus = async (app, status) => {
    await fetch(
      `${API_URL}/employer/applications/${app.job._id}/${app.user._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      }
    );
    setApplications((prev) =>
      prev.map((a) => (a._id === app._id ? { ...a, status } : a))
    );
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const statusPillClass = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "accepted") return "employer-app-status-pill--accepted";
    if (s === "rejected") return "employer-app-status-pill--rejected";
    if (s === "applied") return "employer-app-status-pill--applied";
    return "employer-app-status-pill--pending";
  };

  return (
    <div className="employer-page">
      <h1 className="employer-page-title">Applications</h1>
      {applications.length === 0 ? (
        <p className="employer-empty">No applications found</p>
      ) : (
        <div className="employer-apps-grid">
          {applications.map((app) => {
            const isPending = app.status === "pending";
            const isOpen = expanded[app._id];
            return (
              <div key={app._id} className="employer-app-card">
                <h3 className="employer-app-card-title">{app.job?.title}</h3>

                <p className="employer-app-card-meta">
                  {app.job?.company || "Company"} •{" "}
                  {app.job?.location || "Location"}
                </p>

                <p className="employer-app-card-user">
                  Applicant:{" "}
                  <strong>{app.user?.username || app.user?.email || "User"}</strong>
                </p>

                <div className="employer-app-status-row">
                  <span className="employer-app-status-label">Status</span>
                  <span className={`employer-app-status-pill ${statusPillClass(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(app._id)}
                  style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", textAlign: "left" }}
                >
                  {isOpen ? "Hide Details" : "View Cover Letter and Resume"}
                </button>

                {isOpen && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid #334155", paddingTop: "12px" }}>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 6px" }}>
                        Cover Letter
                      </p>
                      {app.coverLetter
                        ? <p style={{ fontSize: "13px", lineHeight: "1.6", margin: 0, background: "#1e293b", padding: "10px 12px", borderRadius: "8px", color: "#cbd5e1", whiteSpace: "pre-wrap" }}>{app.coverLetter}</p>
                        : <p style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", margin: 0 }}>No cover letter provided</p>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 6px" }}>
                        Resume
                      </p>
                      {app.resumeUrl
                        ? <a href={`${SERVER_URL}${app.resumeUrl}`} target="_blank" rel="noreferrer" style={{ display: "inline-block", fontSize: "13px", fontWeight: "600", color: "#3b82f6", textDecoration: "none", padding: "6px 12px", borderRadius: "8px", border: "1px solid #3b82f6" }}>View Resume PDF</a>
                        : <p style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", margin: 0 }}>No resume uploaded</p>
                      }
                    </div>
                  </div>
                )}

                <div className="employer-btn-group">
                  <button
                    type="button"
                    className="employer-btn-accept"
                    disabled={!isPending}
                    onClick={() => updateStatus(app, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="employer-btn-reject"
                    disabled={!isPending}
                    onClick={() => updateStatus(app, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Applications;