const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite/React dev server
    'http://localhost:8080', // Alternate frontend port
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Serve static files from the root directory (for test HTML files)
app.use(express.static(__dirname));

// Add a route to check if uploads directory is accessible
app.get('/api/check-uploads', (req, res) => {
  const fs = require('fs');
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

app.use('/api/auth', authRoutes);
app.use("/api/jobs", jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// ✅ Add this route for frontend testing
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
