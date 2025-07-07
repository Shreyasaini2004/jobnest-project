import express from "express";
import mongoose from "mongoose";
import { generateEmbedding } from "../config/geminiClient.js";
import Job from "../models/job.js";
import JobSeeker from "../models/jobSeeker.js";
import { sendJobAlertEmail } from "../services/emailService.js";

const router = express.Router();

// ----------------------------
// ✅ GET /api/jobs?recruiterId=xyz
// ----------------------------
router.get('/', async (req, res) => {
  const { recruiterId } = req.query;
  if (!recruiterId) return res.status(400).json({ error: "Missing recruiterId" });

  try {
    const jobs = await Job.find({ postedBy: recruiterId }).select("jobTitle");
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs by recruiter:", err.message);
    res.status(500).json({ error: "Failed to fetch jobs", details: err.message });
  }
});

// ----------------------------
// ✅ POST /api/jobs/create
// ----------------------------

router.post("/create", async (req, res) => {
  console.log("📥 Incoming job:", req.body);

  try {
    const { jobTitle, description } = req.body;

    if (!jobTitle || !description) {
      return res.status(400).json({ error: "jobTitle and description are required" });
    }

    const textToEmbed = `${jobTitle} ${description}`.trim();

    console.log("🧪 Text to embed:", textToEmbed);

    const embedding = await generateEmbedding(textToEmbed);

    console.log("✨ Generated embedding:", embedding);

    const newJob = new Job({
      ...req.body,
      embedding,
    });

    const savedJob = await newJob.save();

    console.log("✅ Job saved:", savedJob);

    // ----------------------------------------
    // 📡 Notify relevant users by email
    // ----------------------------------------
    const users = await JobSeeker.find({
      embedding: { $exists: true, $not: { $size: 0 } }
    }).lean();

    const cosineSimilarity = (vecA, vecB) => {
      const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      if (magA === 0 || magB === 0) return 0;
      return dot / (magA * magB);
    };

    for (const user of users) {
      const similarity = cosineSimilarity(user.embedding, embedding);
      if (similarity >= 0.7) {
        await sendJobAlertEmail(user.email, user.firstName, savedJob);
      }
    }

    res.status(201).json(savedJob);
  } catch (err) {
    console.error("❌ Error creating job:", err);
    res.status(500).json({ error: "Failed to create job", details: err.message });
  }
});


// ----------------------------
// ✅ GET /api/jobs/all
// ----------------------------
router.get("/all", async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .populate('postedBy', 'companyName');
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err.message);
    res.status(500).json({ error: "Failed to fetch jobs", details: err.message });
  }
});

// ----------------------------
// ✅ GET /api/jobs/featured
// ----------------------------
router.get("/featured", async (req, res) => {
  try {
    const featuredJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('postedBy', 'companyName');
    res.status(200).json(featuredJobs);
  } catch (err) {
    console.error("❌ Error fetching featured jobs:", err.message);
    res.status(500).json({ error: "Failed to fetch featured jobs", details: err.message });
  }
});

// ----------------------------
// ✅ GET /api/jobs/:id
// ----------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid job ID format" });
    }

    const job = await Job.findById(id).populate('postedBy', 'companyName companyEmail companyWebsite');

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json(job);
  } catch (err) {
    console.error("❌ Error fetching job:", err.message);
    res.status(500).json({ error: "Failed to fetch job", details: err.message });
  }
});

// ----------------------------
// ✅ GET /api/jobs/search/filters
// ----------------------------
router.get("/search/filters", async (req, res) => {
  try {
    const { searchTerm, jobType, location } = req.query;

    const query = {};

    if (searchTerm) {
      query.$or = [
        { jobTitle: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { requirements: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (jobType && jobType !== 'all') {
      query.jobType = { $regex: jobType, $options: 'i' };
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'companyName');

    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error searching jobs:", err.message);
    res.status(500).json({ error: "Failed to search jobs", details: err.message });
  }
});

// ----------------------------
// ✅ GET /api/jobs/employer/:employerId
// ----------------------------
router.get("/employer/:employerId", async (req, res) => {
  try {
    const { employerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employerId)) {
      return res.status(400).json({ error: "Invalid employer ID format" });
    }

    const jobs = await Job.find({ postedBy: employerId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching employer jobs:", err.message);
    res.status(500).json({ error: "Failed to fetch employer jobs", details: err.message });
  }
});

// ----------------------------
// ✅ PUT /api/jobs/:id
// ----------------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid job ID format" });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json(updatedJob);
  } catch (err) {
    console.error("❌ Error updating job:", err.message);
    res.status(500).json({ error: "Failed to update job", details: err.message });
  }
});

// ----------------------------
// ✅ DELETE /api/jobs/:id
// ----------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid job ID format" });
    }

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting job:", err.message);
    res.status(500).json({ error: "Failed to delete job", details: err.message });
  }
});

export default router;
