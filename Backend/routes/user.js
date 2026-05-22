const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const User = require("../models/user");
const upload = require("../middleware/upload");

// 🔥 GET applied jobs
router.get("/applied-jobs", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = user.id;

    // 🔥 Only fetch needed fields
    const jobs = await Job.find(
      { "applications.user": userId },
      "title company location applications"
    ).lean();

    const appliedJobs = [];

    jobs.forEach((job) => {
      job.applications.forEach((app) => {
        if (app.user.toString() === userId) {
          appliedJobs.push({
            jobId: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            coverLetter: app.coverLetter,
            status: app.status,
            appliedAt: app.appliedAt,
          });
        }
      });
    });

    res.json(appliedJobs);

  } catch (err) {
    console.error("Error fetching applied jobs:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 🔥 POST upload resume
router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    
    // Update user in DB
    await User.findByIdAndUpdate(user.id, { resumeUrl });

    res.json({ success: true, message: "Resume uploaded successfully", resumeUrl });
  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({ error: "Server error during upload" });
  }
});

// 🔥 PUT update skills
router.put("/skills", async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: "Skills must be an array" });
    }

    await User.findByIdAndUpdate(user.id, { skills });
    
    res.json({ success: true, message: "Skills updated", skills });
  } catch (err) {
    console.error("Update skills error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;