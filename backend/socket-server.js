const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow CORS for all origins

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
    'http://localhost:5173', // Vite/React dev server
    'http://localhost:8080', // Alternate frontend port
    'http://localhost:3000', // Another common frontend port
  ], // Allow all origins for dev; restrict in production!
    methods: ['GET', 'POST']
  }
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('sendMessage', ({ room, message }) => {
    io.to(room).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 