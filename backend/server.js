// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// require('dotenv').config({ path: path.join(__dirname, '.env') });

// const authRoutes = require('./routes/auth');
// const jobRoutes = require('./routes/jobs');
// const applicationRoutes = require('./routes/applications');
// const userRoutes = require('./routes/users');
// const eventRoutes = require('./routes/events');
// const atsRouter = require('./routes/ats');

// const app = express();
// app.use(cors({
//   origin: [
//     'http://localhost:5173', // Vite/React dev server
//     'http://localhost:8080', // Alternate frontend port
//     'http://localhost:3000', // Another common frontend port
//   ],
//   credentials: true,
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Serve uploads directory
// const uploadsPath = path.join(__dirname, 'uploads');
// console.log('Serving static files from:', uploadsPath);
// app.use('/uploads', express.static(uploadsPath));

// // Serve static files from the root directory (for test HTML files)
// app.use(express.static(__dirname));

// // Add a route to check if uploads directory is accessible
// app.get('/api/check-uploads', (req, res) => {
//   const fs = require('fs');
//   try {
//     if (!fs.existsSync(uploadsPath)) {
//       fs.mkdirSync(uploadsPath, { recursive: true });
//       console.log('Created uploads directory');
//     }
//     const files = fs.readdirSync(uploadsPath);
//     res.json({ success: true, files, path: uploadsPath });
//   } catch (err) {
//     console.error('Error accessing uploads directory:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// }); 

// app.use('/api/auth', authRoutes);
// app.use("/api/jobs", jobRoutes);
// app.use('/api/applications', applicationRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/ats', atsRouter);

// // ✅ Add this route for frontend testing
// app.get('/api/hello', (req, res) => {
//   res.json({ message: 'Hello from backend!' });
// });

// const PORT = process.env.PORT || 5000;

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ Connected to MongoDB Atlas');
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => console.error('MongoDB connection error:', err));



// backend/server.js (UNIFIED AND CORRECTED)

// ===================================
//  1. IMPORTS
// ===================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http'); // <-- Added from socket-server.js
const { Server } = require('socket.io'); // <-- Added from socket-server.js
require('dotenv').config({ path: path.join(__dirname, '.env') });



// Import your API route handlers
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const atsRouter = require('./routes/ats');


// ===================================
//  2. INITIALIZE APP & UNIFIED SERVER
// ===================================
const app = express();
const server = http.createServer(app); // Create an HTTP server that uses your Express app

// ===================================
//  3. CONFIGURE SOCKET.IO SERVER
// ===================================
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
    ],
    methods: ["GET", "POST"],
  },
});

// ===================================
//  4. CONFIGURE EXPRESS MIDDLEWARE
// ===================================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Static file serving
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(__dirname));

// ===================================
//  5. DEFINE SOCKET.IO EVENT LISTENERS
// ===================================

// In-memory storage for message history
const messageHistory = {};

io.on('connection', (socket) => {
  console.log(`✅ Socket.IO: User Connected - ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket.IO: User ${socket.id} joined room: ${room}`);
    
    // Send message history to the user when they join a room
    if (messageHistory[room]) {
      socket.emit('message_history', messageHistory[room]);
      console.log(`Socket.IO: Sent message history to user ${socket.id} for room ${room}`);
    }
  });

  socket.on('send_message', (data) => {
    // Store message in history
    if (!messageHistory[data.room]) {
      messageHistory[data.room] = [];
    }
    messageHistory[data.room].push(data);
    
    // This broadcasts the message to everyone else in the same room
    socket.to(data.room).emit('receive_message', data);
    console.log(`Socket.IO: Message sent to room ${data.room}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket.IO: User Disconnected - ${socket.id}`);
  });
});

// ===================================
//  6. DEFINE API ROUTES
// ===================================
app.use('/api/auth', authRoutes);
app.use("/api/jobs", jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ats', atsRouter);


// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// ===================================
//  7. START THE UNIFIED SERVER
// ===================================
const PORT = process.env.PORT || 5000; // This will be the single port for your entire backend

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // CRITICAL: Use server.listen(), NOT app.listen().
    // This starts the server that understands both HTTP requests and WebSocket connections.
    server.listen(PORT, () => {
      console.log(`🚀 Unified Server (API & Sockets) running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));