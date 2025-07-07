import express from "express";
import JobApplication from "../models/ApplicationForm.js";
import Job from "../models/job.js";

const router = express.Router();

// -------------------------
// ✅ POST /api/applications
// -------------------------
router.post("/", async (req, res) => {
  try {
    const {
      jobId,
      postedBy,
      name,
      phoneNumber,
      email,
      coverLetter,
      resumeUrl,
      githubLinkedinUrl,
    } = req.body;

    // ✅ Validate required fields
    if (!jobId || !postedBy || !name || !phoneNumber || !email || !coverLetter || !resumeUrl) {
      console.error("Missing required fields:", req.body);
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // ✅ Confirm job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // ✅ Create application
    const newApplication = new JobApplication({
      job: jobId,
      postedBy,
      name,
      phoneNumber,
      email,
      coverLetter,
      resumeUrl,
      githubLinkedinUrl,
    });

    await newApplication.save();

    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error creating application:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// -------------------------
// ✅ GET /api/applications
// -------------------------
router.get("/", async (req, res) => {
  try {
    const { postedBy, jobId } = req.query;

    if (!postedBy) {
      return res.status(400).json({ error: "Missing postedBy (recruiterId) in query" });
    }

    const filter = { postedBy };
    if (jobId) {
      filter.job = jobId;
    }

    const applications = await JobApplication.find(filter)
      .populate("job")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

export default router;
