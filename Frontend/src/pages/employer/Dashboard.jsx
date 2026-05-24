import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import "./employer-pages.css";
import { API_URL } from "../../config";

const PIE_COLORS = ["#94a3b8", "#22c55e", "#ef4444"];

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartTick = isDark ? "#94a3b8" : "#64748b";
  const tooltipStyle = {
    background: isDark ? "#1a1d27" : "#ffffff",
    border: `1px solid ${isDark ? "#2e3348" : "#e2e8f0"}`,
    borderRadius: "8px",
    color: isDark ? "#f1f5f9" : "#0f172a",
  };

  useEffect(() => {
    fetch(`${API_URL}/employer/jobs`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(console.log);
  }, []);

  const updateStatus = async (jobId, userId, status) => {
    try {
      const res = await fetch(
        `${API_URL}/employer/applications/${jobId}/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        setJobs((prev) =>
          prev.map((job) => ({
            ...job,
            applications: job.applications?.map((app) =>
              app.user?._id === userId ? { ...app, status } : app
            ),
          }))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const totalJobs = jobs.length;
  const totalApplications = jobs.reduce(
    (sum, job) => sum + (job.applications?.length || 0), 0
  );

  const barData = jobs.map((job) => ({
    name: job.title.substring(0, 15) + (job.title.length > 15 ? "..." : ""),
    applicants: job.applications?.length || 0,
  }));

  const statusCounts = { pending: 0, accepted: 0, rejected: 0 };
  jobs.forEach((job) => {
    job.applications?.forEach((app) => {
      if (statusCounts[app.status] !== undefined) statusCounts[app.status]++;
    });
  });

  const pieData = [
    { name: "Pending", value: statusCounts.pending },
    { name: "Accepted", value: statusCounts.accepted },
    { name: "Rejected", value: statusCounts.rejected },
  ];

  const statusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted") return "employer-status-badge--accepted";
    if (s === "rejected") return "employer-status-badge--rejected";
    return "employer-status-badge--pending";
  };

  return (
    <div className="employer-page">
      <h1 className="employer-page-title">Employer Dashboard</h1>

      <div className="employer-stats">
        <div className="employer-stat-card">
          <h3>Total Jobs</h3>
          <p>{totalJobs}</p>
        </div>
        <div className="employer-stat-card">
          <h3>Total Applications</h3>
          <p>{totalApplications}</p>
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="employer-charts">
          <div className="employer-chart-card">
            <h3>Applications Per Job</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: chartTick, fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: chartTick }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="applicants" fill={isDark ? "#94a3b8" : "#64748b"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="employer-chart-card">
            <h3>Overall Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: chartTick }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="employer-empty">No jobs or applications yet</p>
      ) : (
        jobs.map((job) => (
          <div key={job._id} className="employer-job-card">
            <div style={{ marginBottom: "15px" }}>
              <h2>{job.title}</h2>
              <p className="employer-meta">{job.company} • {job.location}</p>
              {job.deadline && (
                <p className={new Date() > new Date(job.deadline) ? "employer-meta employer-meta--danger" : "employer-meta"}>
                  Deadline:{" "}
                  {new Date(job.deadline).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  {new Date() > new Date(job.deadline) && " (Closed)"}
                </p>
              )}
              <p className="employer-meta">{job.applications?.length || 0} Applicants</p>
            </div>

            {job.applications?.length === 0 ? (
              <p className="employer-meta">No applicants</p>
            ) : (
              job.applications.map((app) => {
                const isFinal = app.status === "accepted" || app.status === "rejected";
                return (
                  <div key={app._id} className="employer-app-row">
                    <div>
                      <p className="employer-app-name">{app.user?.username || app.user?.email || "User"}</p>
                      <span className={`employer-status-badge ${statusClass(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="employer-btn-group">
                      <button type="button" className="employer-btn-accept" disabled={isFinal} onClick={() => updateStatus(job._id, app.user?._id, "accepted")}>Accept</button>
                      <button type="button" className="employer-btn-reject" disabled={isFinal} onClick={() => updateStatus(job._id, app.user?._id, "rejected")}>Reject</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;