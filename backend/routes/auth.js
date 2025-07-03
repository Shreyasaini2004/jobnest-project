const express = require("express");
const router = express.Router();
const Employer = require("../models/employer");
const JobSeeker = require("../models/jobSeeker");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');

// Multer config
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Log the destination path
    console.log('Upload destination path:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Add file filter to only allow images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    console.log('File rejected - not an image:', file.originalname);
    return cb(new Error('Only image files are allowed!'), false);
  }
  console.log('File accepted:', file.originalname);
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
  
      // ✅ Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const employer = new Employer({
        firstName,
        lastName,
        email,
        companyName,
        companyEmail,
        jobTitle,
        companyWebsite,
        password: hashedPassword, // ✅ Use hashed password
      });
  
      await employer.save();
      res.status(201).json({
        message: "Employer registered",
        user: {
          _id: employer._id,
          name: `${employer.firstName} ${employer.lastName}`,
          email: employer.email,
          userType: "employer",
          createdAt: employer.createdAt
        }
      });
      
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Signup failed" });
    }
  });
  

// Employer Login Route
router.post("/employer/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const employer = await Employer.findOne({ email });
      if (!employer) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      const isMatch = await bcrypt.compare(password, employer.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      res.status(200).json({
        message: "Login successful",
        user: {
          _id: employer._id,
          firstName: employer.firstName,
          lastName: employer.lastName,
          name: employer.firstName + " " + employer.lastName,
          email: employer.email,
          userType: "employer",
          avatar: employer.avatar // Include the avatar if it exists
        },
      });
  
    } catch (err) {
      console.error("Employer Login Error:", err);
      res.status(500).json({ error: "Login failed" });
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
      res.status(201).json({
        message: "Job Seeker registered successfully",
        user: {
          _id: newJobSeeker._id,
          name: `${newJobSeeker.firstName} ${newJobSeeker.lastName}`,
          email: newJobSeeker.email,
          userType: "job-seeker",
          createdAt: newJobSeeker.createdAt
        }
      });
      
  
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
          _id: jobSeeker._id, // Include the user ID
          firstName: jobSeeker.firstName,
          lastName: jobSeeker.lastName,
          email: jobSeeker.email,
          userType: "job-seeker",
          avatar: jobSeeker.avatar // Include the avatar if it exists
        }
      });
      
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

// Test endpoint for file upload
router.post('/test-upload', upload.single('testFile'), (req, res) => {
  console.log('Test upload request received');
  console.log('Request file:', req.file);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl });
});

// Avatar upload endpoint (supports both Job Seeker and Employer)
router.post('/users/upload-avatar', upload.single('avatar'), async (req, res) => {
  console.log('Avatar upload request received');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  try {
    const { userId } = req.body;
    
    // Validate inputs
    if (!userId) {
      console.error('Missing userId in request');
      return res.status(400).json({ error: 'Missing userId' });
    }
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File uploaded successfully:', req.file.filename);
    console.log('File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
    
    // Full URL to the uploaded file
    const avatarUrl = `/uploads/${req.file.filename}`;
    console.log('Avatar URL:', avatarUrl);
    
    // Try to update JobSeeker first
    console.log('Attempting to update JobSeeker with ID:', userId);
    let user = await JobSeeker.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
    
    // If no JobSeeker found, try Employer
    if (!user) {
      console.log('No JobSeeker found, trying Employer');
      user = await Employer.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
    }
    
    if (!user) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully:', user._id);
    
    // Return the full URL to the avatar
    console.log('Sending response with avatar URL:', avatarUrl);
    res.json({ avatar: avatarUrl });
    
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: `Failed to upload avatar: ${err.message}` });
  }
});

module.exports = router;
