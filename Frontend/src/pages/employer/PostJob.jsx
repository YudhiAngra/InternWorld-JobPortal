import { useState } from "react";
import toast from "react-hot-toast";
import "./employer-pages.css";
import { API_URL } from "../../config";

function PostJob() {
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    salary: "",
    technologyStack: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!job.title || !job.company || !job.location || !job.salary || !job.description || !job.technologyStack || !job.deadline) {
      toast.error("All fields are required ❌");
      return;
    }

    const selectedDeadline = new Date(job.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDeadline < today) {
      toast.error("Deadline cannot be in the past ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/employer/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(job),
      });

      if (res.ok) {
        toast.success("Job posted successfully 🚀");
        setJob({ title: "", company: "", location: "", description: "", salary: "", technologyStack: "", deadline: "" });
      } else {
        toast.error("Error posting job ❌");
      }
    } catch {
      toast.error("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-page employer-form-page">
      <form className="employer-form-card" onSubmit={handleSubmit}>
        <h2>Post a Job</h2>

        <label className="employer-form-label">Job Title</label>
        <input className="employer-form-input" value={job.title} placeholder="Enter job title" onChange={(e) => setJob({ ...job, title: e.target.value })} />

        <label className="employer-form-label">Company</label>
        <input className="employer-form-input" value={job.company} placeholder="Enter company name" onChange={(e) => setJob({ ...job, company: e.target.value })} />

        <label className="employer-form-label">Location</label>
        <input className="employer-form-input" value={job.location} placeholder="Enter location" onChange={(e) => setJob({ ...job, location: e.target.value })} />

        <label className="employer-form-label">Salary</label>
        <input type="number" className="employer-form-input" value={job.salary} placeholder="Enter salary" onChange={(e) => setJob({ ...job, salary: e.target.value })} />

        <label className="employer-form-label">Description</label>
        <textarea className="employer-form-textarea" value={job.description} placeholder="Enter job description" onChange={(e) => setJob({ ...job, description: e.target.value })} />

        <label className="employer-form-label">Tech Stack</label>
        <input className="employer-form-input" value={job.technologyStack} placeholder="e.g. Java, React, Node" onChange={(e) => setJob({ ...job, technologyStack: e.target.value })} />

        <label className="employer-form-label">Application Deadline</label>
        <input type="date" className="employer-form-input" value={job.deadline} onChange={(e) => setJob({ ...job, deadline: e.target.value })} />

        <button type="submit" className="employer-form-submit" disabled={loading} style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}

export default PostJob;