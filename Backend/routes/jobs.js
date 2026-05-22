const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const upload = require("../middleware/upload");

// ==============================
// GET ALL JOBS
// ==============================
router.get("/", async (req, res) => {
  try {
    const { search, location, tech, company, sort } = req.query;

    const filter = {};

    if (search) filter.title = { $regex: new RegExp(search, "i") };
    if (location) filter.location = { $regex: new RegExp(location, "i") };
    if (company) filter.company = { $regex: new RegExp(company, "i") };
    if (tech)
      filter.technologyStack = { $in: [new RegExp(tech, "i")] };

    let sortOption = { postedAt: -1 };

    if (sort === "salary_asc") sortOption = { salary: 1 };
    else if (sort === "salary_desc") sortOption = { salary: -1 };

    const jobs = await Job.find(filter).sort(sortOption);

    const processedJobs = jobs.map((job) => ({
      ...job.toObject(),
      techStackString: job.technologyStack?.join(", ") || "N/A",
    }));

    res.json(processedJobs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==============================
// GET SINGLE JOB
// ==============================
router.get("/:jobId", async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json({
      ...job.toObject(),
      techStackString: job.technologyStack?.join(", ") || "N/A",
    });
  } catch {
    res.status(500).json({ error: "Error fetching job" });
  }
});

// ==============================
// APPLY TO JOB
// ==============================
router.post("/apply/:jobId", upload.single("resume"), async (req, res) => {
  try {
    const { coverLetter } = req.body;

    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Mandatory validation
    if (!coverLetter || coverLetter.trim().length < 20) {
      return res.status(400).json({
        error: "Cover letter must be at least 20 characters",
      });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ error: "Application deadline has passed ❌" });
    }

    const alreadyApplied = job.applications.find(
      (app) => app.user.toString() === req.session.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ error: "Already applied" });
    }

    // Build application object
    const application = {
      user: req.session.user.id,
      coverLetter: coverLetter.trim(),
      status: "pending",
      appliedAt: new Date(),
    };

    // If a resume was uploaded, store its relative URL
    if (req.file) {
      application.resumeUrl = `/uploads/${req.file.filename}`;
    }

    job.applications.push(application);
    await job.save();

    res.json({ success: true, message: "Application submitted" });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ error: err.message || "Error submitting application" });
  }
});

module.exports = router;