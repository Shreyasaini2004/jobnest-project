// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import path from 'path';
// import cookieParser from 'cookie-parser';
// import http from 'http';
// import { Server } from 'socket.io';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// // At the top with other imports
// import Message from './models/message.js';

// // Configure dotenv
// dotenv.config();

// // Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Import routes
// import authRoutes from './routes/auth.js';
// import jobRoutes from './routes/jobs.js';
// import eventsRoutes from './routes/events.js';
// import usersRoutes from './routes/users.js';
// import atsRoutes from './routes/ats.js';
// import applicationsRoutes from './routes/applications.js';
// import chatRoutes from './routes/chat.js';


// // ===================================
// // INITIALIZE APP & UNIFIED SERVER
// // ===================================
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// app.use(cors({
//   origin: "http://localhost:8080",
//   credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Serve uploads directory
// const uploadsPath = path.join(__dirname, 'uploads');
// app.use('/uploads', express.static(uploadsPath));

// // Serve static files from the root directory (for test HTML files)
// app.use(express.static(__dirname));

// // Add a route to check if uploads directory is accessible
// app.get('/api/check-uploads', async (req, res) => {
//   const fs = await import('fs');
//   try {
//     if (!fs.existsSync(uploadsPath)) {
//       fs.mkdirSync(uploadsPath, { recursive: true });
//       console.log('Created uploads directory');
//     }
//     res.json({ success: true, message: 'Uploads directory is accessible' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Socket.io message history storage
// // const messageHistory = {};

// // Socket.io connection handling
// io.on('connection', (socket) => {
//   console.log(`✅ Socket.IO: User Connected - ${socket.id}`);
  
//   socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`Socket.IO: User ${socket.id} joined room ${room}`);
    
//     // Send message history to the user when they join a room
//     if (messageHistory[room]) {
//       socket.emit('message_history', messageHistory[room]);
//     }
//   });

//   socket.on('send_message', (data) => {
//     // Store message in history
//     if (!messageHistory[data.room]) {
//       messageHistory[data.room] = [];
//     }
//     messageHistory[data.room].push(data);
    
//     // This broadcasts the message to everyone else in the same room
//     socket.to(data.room).emit('receive_message', data);
//     console.log(`Socket.IO: Message sent to room ${data.room}`);
//   });

//   socket.on('disconnect', () => {
//     console.log(`❌ Socket.IO: User Disconnected - ${socket.id}`);
//   });
// });

// app.use('/api/auth', authRoutes);
// app.use("/api/jobs", jobRoutes);
// app.use('/api/events', eventsRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/ats', atsRoutes);
// app.use('/api/applications', applicationsRoutes);
// app.use('/api/chat', chatRoutes);

// // ✅ Add this route for frontend testing
// app.get('/api/hello', (req, res) => {
//   res.json({ message: 'Hello from backend!' });
// });

// const PORT = process.env.PORT || 5000;

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('✅ Connected to MongoDB Atlas');
//     // CRITICAL: Use server.listen(), NOT app.listen().
//     // This starts the server that understands both HTTP requests and WebSocket connections.
//     server.listen(PORT, () => {
//       console.log(`🚀 Unified Server (API & Sockets) running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => console.error('MongoDB connection error:', err));




// clear chat and chat persistance 

// ===================================
//  1. IMPORTS
// ===================================
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import the new Message model for persistence
import Message from './models/message.js';

// Import all API routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import eventsRoutes from './routes/events.js';
import usersRoutes from './routes/users.js';
import atsRoutes from './routes/ats.js';
import applicationsRoutes from './routes/applications.js';
import chatRoutes from './routes/chat.js';

// ===================================
//  CONFIGURATION
// ===================================
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===================================
//  SERVER & MIDDLEWARE SETUP
// ===================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Express Middleware
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Static file serving for uploads
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// ===================================
//  SOCKET.IO LOGIC WITH DATABASE PERSISTENCE
// ===================================
io.on('connection', (socket) => {
  console.log(`✅ Socket.IO: User Connected - ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket.IO: User ${socket.id} joined room ${room}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        room: data.room,
        author: data.author,
        message: data.message,
        time: data.time
      });
      const savedMessage = await newMessage.save();
      console.log(`DB: Message saved for room ${data.room}`);
      socket.to(data.room).emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error saving or broadcasting message:', error);
    }
  });

  // NEW: Listener to handle clearing chat history for a room
  socket.on('clear_chat', async (room) => {
    try {
      // 1. Delete all messages from the database for the given room
      const result = await Message.deleteMany({ room: room });
      console.log(`DB: Cleared ${result.deletedCount} messages for room ${room} via socket event.`);

      // 2. Emit an event to ALL clients in the room (including the sender)
      //    to tell them to clear their UI.
      io.in(room).emit('chat_cleared');

    } catch (error) {
      console.error(`Error clearing chat for room ${room}:`, error);
      // Optionally emit an error back to the user who tried to clear
      socket.emit('clear_chat_error', { message: 'Failed to clear chat.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket.IO: User Disconnected - ${socket.id}`);
  });
});

// ===================================
//  API ROUTES
// ===================================
app.use('/api/auth', authRoutes);
app.use("/api/jobs", jobRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/chat', chatRoutes);

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// ===================================
//  DATABASE CONNECTION & SERVER START
// ===================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    server.listen(PORT, () => {
      console.log(`🚀 Unified Server (API & Sockets) running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
