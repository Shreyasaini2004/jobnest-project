const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const mongoose = require('mongoose');

// Create a new job
router.post("/create", async (req, res) => {
  console.log("📥 Job data received:", req.body);

  try {
    const job = new Job(req.body);
    const saved = await job.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error saving job:", err.message);
    res.status(500).json({ error: "Failed to create job", details: err.message });
  }
});

// Get all jobs
router.get("/all", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).populate('postedBy', 'companyName');
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err.message);
    res.status(500).json({ error: "Failed to fetch jobs", details: err.message });
  }
});

// Get featured jobs
router.get("/featured", async (req, res) => {
  try {
    // Get the 6 most recent jobs
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

// Get job by ID
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

// Search jobs with filters
router.get("/search/filters", async (req, res) => {
  try {
    const { searchTerm, jobType, location } = req.query;
    
    // Build the query object
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

// Get jobs posted by a specific employer
router.get("/employer/:employerId", async (req, res) => {
  try {
    const { employerId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(employerId)) {
      return res.status(400).json({ error: "Invalid employer ID format" });
    }
    
    const jobs = await Job.find({ postedBy: employerId })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'companyName');
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching employer jobs:", err.message);
    res.status(500).json({ error: "Failed to fetch employer jobs", details: err.message });
  }
});

// Update a job
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

// Delete a job
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

module.exports = router;