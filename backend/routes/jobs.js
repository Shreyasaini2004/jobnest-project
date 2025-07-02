const express = require('express');
const router = express.Router();
const Job = require('../models/job');

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

module.exports = router;