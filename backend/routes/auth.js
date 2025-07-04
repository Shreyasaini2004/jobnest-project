const express = require("express");
const router = express.Router();
const Employer = require("../models/employer");
const JobSeeker = require("../models/jobSeeker");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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

      // Create JWT
      const token = jwt.sign(
        { _id: employer._id, role: 'employer', email: employer.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
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
        }
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

      // Create JWT
      const token = jwt.sign(
        { _id: jobSeeker._id, role: 'job-seeker', email: jobSeeker.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
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

// Import cloudinary at the top of the file
const cloudinary = require('../config/cloudinary');
// Remove this line as fs is already declared at the top of the file
// const fs = require('fs');

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
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'jobnest/avatars',
      use_filename: true,
      unique_filename: true,
    });
    
    console.log('Cloudinary upload result:', result);
    
    // Delete the local file after uploading to Cloudinary
    fs.unlinkSync(req.file.path);
    
    // Get the Cloudinary URL
    const avatarUrl = result.secure_url;
    console.log('Cloudinary Avatar URL:', avatarUrl);
    
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

// Employer Logout Route
router.post("/employer/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

// Job Seeker Logout Route
router.post("/jobseeker/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
