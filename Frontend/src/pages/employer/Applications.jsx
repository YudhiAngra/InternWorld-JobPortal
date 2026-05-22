import React, { useEffect, useState } from "react";
import "./employer-pages.css";

function Applications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/employer/applications", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setApplications(Array.isArray(data) ? data : []));
  }, []);

  const updateStatus = async (app, status) => {
    await fetch(
      `http://localhost:4000/api/employer/applications/${app.job._id}/${app.user._id}`,
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

            return (
              <div key={app._id} className="employer-app-card">
                <h3 className="employer-app-card-title">{app.job?.title}</h3>

                <p className="employer-app-card-meta">
                  {app.job?.company || "Company"} •{" "}
                  {app.job?.location || "Location"}
                </p>

                <p className="employer-app-card-user">
                  Applicant:{" "}
                  <strong>
                    {app.user?.username || app.user?.email || "User"}
                  </strong>
                </p>

                <div className="employer-app-status-row">
                  <span className="employer-app-status-label">Status</span>
                  <span
                    className={`employer-app-status-pill ${statusPillClass(app.status)}`}
                  >
                    {app.status}
                  </span>
                </div>

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
