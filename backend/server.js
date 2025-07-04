const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ✅ Import all route files
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/userRoutes'); // ✅ Fix here

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Use userRoutes before /api/auth fallback
app.use('/api/auth/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

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
