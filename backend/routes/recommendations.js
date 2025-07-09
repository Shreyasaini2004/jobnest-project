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

    const userLocation = user.location?.toLowerCase() || "";
    const userSkills = user.skills?.toLowerCase() || "";
    const userEducation = user.education?.toLowerCase() || "";

    // ✅ Fetch jobs with embeddings AND populate postedBy
    const jobs = await Job.find({ embedding: { $exists: true, $not: { $size: 0 } } })
      .populate('postedBy', 'companyName')  // ✅ Populate companyName of recruiter
      .lean();

    // Score jobs
    const scoredJobs = jobs.map(job => {
      let score = cosineSimilarity(user.embedding, job.embedding);

      if (job.location && userLocation && job.location.toLowerCase() === userLocation) {
        score += 0.2;
      }

      let requirementsMatch = false;
      if (job.requirements) {
        const reqLower = job.requirements.toLowerCase();
        if (
          reqLower.includes(userSkills) ||
          reqLower.includes(userEducation)
        ) {
          requirementsMatch = true;
        }
      }

      if (requirementsMatch) {
        score += 0.3;
      }

      return {
        ...job,
        similarity: score
      };
    });

    scoredJobs.sort((a, b) => b.similarity - a.similarity);
    const topJobs = scoredJobs.slice(0, 10);

    res.status(200).json(topJobs);

  } catch (err) {
    console.error("Error in recommendations:", err.message);
    res.status(500).json({ error: "Failed to fetch recommendations", details: err.message });
  }
});

export default router;
