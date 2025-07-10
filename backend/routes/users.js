import express from "express";
import Employer from "../models/employer.js";
import JobSeeker from "../models/jobSeeker.js";
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// Get employer profile by ID
router.get("/employer/:id", async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id).select("-password");
    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }
    res.status(200).json(employer);
  } catch (err) {
    console.error("Error fetching employer profile:", err);
    res.status(500).json({ error: "Failed to fetch employer profile" });
  }
});

// Get job seeker profile by ID
router.get("/jobseeker/:id", async (req, res) => {
  try {
    const jobSeeker = await JobSeeker.findById(req.params.id).select("-password");
    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker not found" });
    }
    res.status(200).json(jobSeeker);
  } catch (err) {
    console.error("Error fetching job seeker profile:", err);
    res.status(500).json({ error: "Failed to fetch job seeker profile" });
  }
});

// Update employer profile
router.put("/employer/:id", async (req, res) => {
  try {
    const updatedEmployer = await Employer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    if (!updatedEmployer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    res.status(200).json(updatedEmployer);
  } catch (err) {
    console.error("Error updating employer profile:", err);
    res.status(500).json({ error: "Failed to update employer profile" });
  }
});

// Update job seeker profile
router.put("/jobseeker/:id", async (req, res) => {
  try {
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    if (!updatedJobSeeker) {
      return res.status(404).json({ error: "Job seeker not found" });
    }

    res.status(200).json(updatedJobSeeker);
  } catch (err) {
    console.error("Error updating job seeker profile:", err);
    res.status(500).json({ error: "Failed to update job seeker profile" });
  }
});

// Onboarding data endpoint
router.post('/onboarding', async (req, res) => {
  try {
    const { userId, userType, ...onboardingData } = req.body;
    let updatedUser;
    if (userType === 'employer') {
      updatedUser = await Employer.findByIdAndUpdate(
        userId,
        { $set: onboardingData },
        { new: true }
      ).select('-password');
    } else {
      updatedUser = await JobSeeker.findByIdAndUpdate(
        userId,
        { $set: onboardingData },
        { new: true }
      ).select('-password');
    }
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error saving onboarding data:', err);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// POST /api/users/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  try {
    // You can customize the welcome message for subscription
    await sendWelcomeEmail(email, 'JobSeeker');
    res.json({ success: true, message: 'Subscription successful! Check your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send subscription email.' });
  }
});

export default router;
