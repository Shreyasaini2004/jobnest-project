// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// ✅ Load .env
dotenv.config();

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Import all route files (ES modules)
import authRoutes from "./routes/auth.js";
import applicationRoutes from "./routes/applications.js";
import jobRoutes from "./routes/jobs.js";
import userRoutes from "./routes/userRoutes.js";
import embeddingRoutes from "./routes/embedding.js";
import recommendationRoutes from "./routes/recommendations.js";
import jobSeekerRoutes from "./routes/jobSeekerRoutes.js"; // ✅ import route

const app = express();

app.use(cors());
app.use(express.json());

// ✅ API routes
app.use('/api/applications', applicationRoutes);
app.use('/api/auth/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/embedding', embeddingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api', jobSeekerRoutes); // ✅ this line was missing earlier

// ✅ Serve uploads folder as static
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// ✅ Serve public HTML/static files from root
app.use(express.static(__dirname));

// ✅ Route to check uploads folder
app.get('/api/check-uploads', (req, res) => {
  try {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('Created uploads directory');
    }
    const files = fs.readdirSync(uploadsPath);
    res.json({ success: true, files, path: uploadsPath });
  } catch (err) {
    console.error('Error accessing uploads directory:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Simple test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// ✅ MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

  import testEmailRoutes from './routes/testEmail.js';

// Add this line with your other route middleware
app.use('/api', testEmailRoutes);