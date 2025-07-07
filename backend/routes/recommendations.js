import express from "express";
import mongoose from "mongoose";
import User from "../models/jobSeeker.js";
import Job from "../models/job.js";

const router = express.Router();

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

router.get("/jobs-for-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Fetch user with embedding
    const user = await User.findById(userId).lean();
    if (!user || !user.embedding || user.embedding.length === 0) {
      return res.status(404).json({ error: "User embedding not found. Please update profile first." });
    }

    // Fetch all jobs with embeddings
    const jobs = await Job.find({ embedding: { $exists: true, $not: { $size: 0 } } }).lean();

    // Calculate similarity
    const scoredJobs = jobs.map(job => ({
      ...job,
      similarity: cosineSimilarity(user.embedding, job.embedding)
    }));

    // Sort by similarity descending
    scoredJobs.sort((a, b) => b.similarity - a.similarity);

    // Return top 10
    const topJobs = scoredJobs.slice(0, 10);

    res.status(200).json(topJobs);
  } catch (err) {
    console.error("Error in recommendations:", err.message);
    res.status(500).json({ error: "Failed to fetch recommendations", details: err.message });
  }
});

export default router;
