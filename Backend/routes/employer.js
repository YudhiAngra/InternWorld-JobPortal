const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const User = require("../models/user");
const { sendApplicationStatusEmail } = require("../utils/emailService");

// ================= CREATE JOB =================
router.post("/jobs", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.role !== "employer") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      title,
      company,
      location,
      description,
      requirements,
      salary,
      technologyStack,
      deadline,
    } = req.body;

    if (!deadline) {
      return res.status(400).json({ error: "Application deadline is required ❌" });
    }

    const newJob = new Job({
      title,
      company,
      location,
      description,
      requirements,
      salary: Number(salary),
      technologyStack: Array.isArray(technologyStack)
        ? technologyStack
        : technologyStack.split(",").map((t) => t.trim()),
      deadline: (() => {
        const d = new Date(deadline);
        d.setHours(23, 59, 59, 999);
        return d;
      })(),
      user: user.id,
    });

    await newJob.save();

    res.json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });

  } catch (err) {
    console.error("Create Job Error:", err);
    res.status(500).json({ error: "Error creating job" });
  }
});


// ================= GET EMPLOYER JOBS (✅ FIXED) =================
router.get("/jobs", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.role !== "employer") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobs = await Job.find({ user: user.id })
      .populate("applications.user", "username email") // ✅ FIX
      .lean();

    // ✅ prevent crash if user is null
    const safeJobs = jobs.map((job) => ({
      ...job,
      applications: (job.applications || []).filter((app) => app.user),
    }));

    res.json(safeJobs);

  } catch (err) {
    console.error("Fetch Jobs Error:", err);
    res.status(500).json({ error: "Error fetching jobs" });
  }
});


// ================= GET ALL APPLICATIONS =================
router.get("/applications", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.role !== "employer") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const jobs = await Job.find({ user: user.id })
      .populate("applications.user", "username email")
      .lean();

    const applications = [];

    jobs.forEach((job) => {
      job.applications.forEach((app) => {
        applications.push({
          _id: app._id,
          user: app.user,
          job: {
            _id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
          },
          status: app.status,
          coverLetter: app.coverLetter,
          resumeUrl: app.resumeUrl,
          appliedAt: app.appliedAt,
        });
      });
    });

    res.json(applications);

  } catch (err) {
    console.error("Fetch Applications Error:", err);
    res.status(500).json({ error: "Error fetching applications" });
  }
});


// ================= UPDATE APPLICATION STATUS =================
router.put("/applications/:jobId/:applicantId", async (req, res) => {
  try {
    const user = req.session.user;

    if (!user || user.role !== "employer") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { jobId, applicantId } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.user.toString() !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const application = job.applications.find(
      (app) => app.user.toString() === applicantId
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = status;

    await job.save();

    // Fetch the user to get their email
    const applicant = await User.findById(applicantId);
    if (applicant && applicant.email) {
      await sendApplicationStatusEmail(applicant.email, job.title, job.company, status);
    }

    res.json({
      success: true,
      message: "Application status updated",
    });

  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;