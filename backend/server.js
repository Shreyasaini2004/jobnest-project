const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

const app = express();
app.use(cors());
app.use(express.json());

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
