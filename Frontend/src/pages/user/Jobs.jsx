import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import JobCard from "../../components/common/JobCard";
import "./Jobs.css";
import { API_URL } from "../../config";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    company: "",
    tech: "",
    sort: "",
  });
  const [loadingAi, setLoadingAi] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load jobs"));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/user/applied-jobs`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        (Array.isArray(data) ? data : []).forEach((app) => {
          map[app.jobId] = app.status;
        });
        setAppliedJobs(map);
      });
  }, []);

  const filteredJobs = jobs
    .filter((j) => (j.title || "").toLowerCase().includes(filters.search.toLowerCase()))
    .filter((j) => (j.location || "").toLowerCase().includes(filters.location.toLowerCase()))
    .filter((j) => (j.company || "").toLowerCase().includes(filters.company.toLowerCase()))
    .filter((j) =>
      (j.technologyStack || [])
        .filter((t) => t && t.trim() !== "")
        .join(" ")
        .toLowerCase()
        .includes(filters.tech.toLowerCase())
    )
    .sort((a, b) => {
      if (filters.sort === "latest") return new Date(b.postedAt) - new Date(a.postedAt);
      if (filters.sort === "salary_asc") return (a.salary || 0) - (b.salary || 0);
      if (filters.sort === "salary_desc") return (b.salary || 0) - (a.salary || 0);
      return 0;
    });

  const handleApply = () => {
    toast.error("Apply from job details page with cover letter ❌");
  };

  const handleAiMatch = async () => {
    setLoadingAi(true);
    const tId = toast.loading("Analyzing your profile & jobs with AI...");
    try {
      const res = await fetch(`${API_URL}/ai/recommendations`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setJobs(data);
        toast.success("AI matched jobs found!", { id: tId });
      } else {
        toast.error("No AI matches or missing profile info.", { id: tId });
      }
    } catch {
      toast.error("AI matching failed", { id: tId });
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="jobs-page container">
      <h1 className="jobs-title title">AVAILABLE JOB LISTINGS</h1>

      <div className="filter-box">
        <div className="filter-main">
          <div className="filter-inputs">
            <input className="filter-input" placeholder="Job title" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <input className="filter-input" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
            <input className="filter-input" placeholder="Company" value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} />
            <input className="filter-input" placeholder="Tech stack" value={filters.tech} onChange={(e) => setFilters({ ...filters, tech: e.target.value })} />
          </div>
        </div>

        <aside className="filter-sidebar">
          <select className="filter-select" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="">Sort by</option>
            <option value="latest">Latest</option>
            <option value="salary_asc">Salary ↑</option>
            <option value="salary_desc">Salary ↓</option>
          </select>

          <div className="filter-actions">
            <button type="button" className="search-btn">Search</button>
            <button type="button" className="search-btn search-btn-ai" onClick={handleAiMatch} disabled={loadingAi}>
              {loadingAi ? "…" : "✨ AI"}
            </button>
          </div>
        </aside>
      </div>

      <div className="grid jobs-grid">
        {filteredJobs.length === 0 ? (
          <p className="jobs-empty">No jobs found</p>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} className="jobs-card-wrap">
              <JobCard
                job={job}
                appliedJobs={appliedJobs}
                onApply={handleApply}
                onDetails={(j) => navigate(`/jobs/${j._id}`)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Jobs;