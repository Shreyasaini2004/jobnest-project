// routes/jobSeekerRoutes.js
import express from "express";
import { getJobSeekerProfile } from "../Controller/jobseekerController.js";

const router = express.Router();

// ✅ Route: GET /api/jobseeker/:id
router.get("/jobseeker/:id", getJobSeekerProfile);

export default router;
