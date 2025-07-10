
import express from "express";
import bcrypt from "bcryptjs";
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from 'path';
import cloudinary from "../config/cloudinary.js";
import { sendWelcomeEmail } from "../services/emailService.js";

// Import models
import Employer from "../models/employer.js";
import JobSeeker from "../models/jobSeeker.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// __dirname workaround in ESM
// --------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Upload destination path:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    console.log('File rejected - not an image:', file.originalname);
    return cb(new Error('Only image files are allowed!'), false);
  }
  console.log('File accepted:', file.originalname);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});


// ---------------------------------------------------
// ✅ Employer Signup
// ---------------------------------------------------
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const employer = new Employer({
      firstName,
      lastName,
      email,
      companyName,
      companyEmail,
      jobTitle,
      companyWebsite,
      password: hashedPassword,
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
    await sendWelcomeEmail(employer.email, `${employer.firstName} ${employer.lastName}`);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});


// ---------------------------------------------------
// ✅ Employer Login
// ---------------------------------------------------
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
        sameSite: 'none',
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
  





// ---------------------------------------------------
// ✅ Job Seeker Signup
// ---------------------------------------------------
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

    // Create JWT
    const token = jwt.sign(
      { _id: newJobSeeker._id, role: 'job-seeker', email: newJobSeeker.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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
  await sendWelcomeEmail(newJobSeeker.email, `${newJobSeeker.firstName} ${newJobSeeker.lastName}`);
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ---------------------------------------------------
// ✅ Job Seeker Login
// ---------------------------------------------------
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
        sameSite: 'none',
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


// ---------------------------------------------------
// ✅ Test Upload Endpoint
// ---------------------------------------------------
router.post('/test-upload', upload.single('testFile'), (req, res) => {
  console.log('Test upload request received');
  console.log('Request file:', req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl });
});


// ---------------------------------------------------
// ✅ Avatar Upload Endpoint
// ---------------------------------------------------
router.post('/users/upload-avatar', upload.single('avatar'), async (req, res) => {
  console.log('Avatar upload request received');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'jobnest/avatars',
      use_filename: true,
      unique_filename: true,
    });

    fs.unlinkSync(req.file.path);

    const avatarUrl = result.secure_url;

    // Update JobSeeker first
    let user = await JobSeeker.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });

    // If not found, update Employer
    if (!user) {
      user = await Employer.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    sameSite: 'none',
  });
  res.json({ message: 'Logged out successfully' });
});

// Job Seeker Logout Route
router.post("/jobseeker/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;
