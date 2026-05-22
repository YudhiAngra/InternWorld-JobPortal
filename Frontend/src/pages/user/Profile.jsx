import React, { useState } from "react";
import toast from "react-hot-toast";

function Profile() {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadResume = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file first!");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:4000/api/user/upload-resume", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("An error occurred during upload");
    }
  };

  const saveSkills = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s);
    if (skillsArray.length === 0) return toast.error("Please enter some skills");

    try {
      const res = await fetch("http://localhost:4000/api/user/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillsArray }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Skills updated!");
      } else {
        toast.error("Failed to update skills");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div style={{ padding: "40px 20px", width: "100%", maxWidth: "600px", margin: "0 auto", minHeight: "80vh", boxSizing: "border-box" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>My Profile</h1>

      <div style={cardStyle}>
        <h2>Upload Resume</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "15px", fontSize: "14px" }}>
          Upload your latest resume (PDF, DOC, DOCX) to get better job recommendations. Max size: 5MB.
        </p>
        <form onSubmit={uploadResume} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" style={inputStyle} />
          <button type="submit" className="counter" style={{ width: "fit-content" }}>Upload Resume</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h2>My Skills</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "15px", fontSize: "14px" }}>
          Enter your skills separated by commas (e.g., React, Node.js, Python).
        </p>
        <form onSubmit={saveSkills} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <textarea 
            value={skills} 
            onChange={(e) => setSkills(e.target.value)} 
            placeholder="React, Node.js, Python..."
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} 
          />
          <button type="submit" className="counter" style={{ width: "fit-content" }}>Save Skills</button>
        </form>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  padding: "25px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "var(--shadow)",
  width: "100%",
  boxSizing: "border-box"
};

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid var(--border)",
  fontFamily: "inherit",
  background: "var(--code-bg)",
  color: "var(--text-h)"
};

export default Profile;
