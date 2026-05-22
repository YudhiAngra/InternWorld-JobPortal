import React, { useEffect, useState } from "react";
import "./AppliedJobs.css";

function AppliedJobs() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/user/applied-jobs", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  }, []);

  const statusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted") return "applied-job-status--accepted";
    if (s === "rejected") return "applied-job-status--rejected";
    if (s === "applied") return "applied-job-status--applied";
    return "applied-job-status--pending";
  };

  return (
    <div className="applied-jobs-page">
      <h1 className="applied-jobs-title">Applied Jobs</h1>

      <div className="applied-jobs-grid">
        {applications.length === 0 ? (
          <p className="applied-jobs-empty">No applications found</p>
        ) : (
          applications.map((app, index) => (
            <div key={app._id || app.jobId || index} className="applied-job-card">
              <h3>{app.title}</h3>

              <p>
                <span className="applied-job-label">Company: </span>
                <span className="applied-job-value">{app.company}</span>
              </p>

              <p>
                <span className="applied-job-label">Location: </span>
                <span className="applied-job-value">{app.location}</span>
              </p>

              <div className="applied-job-status-row">
                <span className="applied-job-label">Status: </span>
                <span
                  className={`applied-job-status ${statusClass(app.status)}`}
                >
                  {(app.status || "pending").toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AppliedJobs;
