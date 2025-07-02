const express = require("express");
const router = express.Router();
const Employer = require("../models/employer");
const JobSeeker = require("../models/jobSeeker");
const bcrypt = require("bcryptjs");

// Employer Signup
router.post("/employer/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    companyName,
    companyEmail,
    jobTitle,
    companyWebsite,
    password,
    confirmPassword
  } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const employerExists = await Employer.findOne({ email });
    if (employerExists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const employer = new Employer({
      firstName,
      lastName,
      email,
      companyName,
      companyEmail,
      jobTitle,
      companyWebsite,
      password, // NOTE: We'll hash it later!
    });

    await employer.save();
    res.status(201).json({ message: "Employer registered", employer });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Job Seeker Signup Route
router.post("/jobseeker/signup", async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
  
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
  
    try {
      const existingUser = await JobSeeker.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newJobSeeker = new JobSeeker({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
  
      await newJobSeeker.save();
      res.status(201).json({ message: "Job Seeker registered successfully" });
  
    } catch (err) {
      console.error("Signup Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Job Seeker Login Route
router.post("/jobseeker/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const jobSeeker = await JobSeeker.findOne({ email });
      if (!jobSeeker) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      const isMatch = await bcrypt.compare(password, jobSeeker.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      res.status(200).json({
        message: "Login successful",
        user: {
          firstName: jobSeeker.firstName,
          lastName: jobSeeker.lastName,
          email: jobSeeker.email,
          userType: "job-seeker"
        }
      });
      

  
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

module.exports = router;
