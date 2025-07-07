const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow CORS for all origins

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev; restrict in production!
    methods: ['GET', 'POST']
  }
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle room joining - support both event names for compatibility
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Handle message sending - support both event names for compatibility
  socket.on('send_message', (messageData) => {
    io.to(messageData.room).emit('receive_message', messageData);
    console.log(`Message sent to room ${messageData.room}:`, messageData);
  });

  socket.on('sendMessage', ({ room, message }) => {
    io.to(room).emit('receiveMessage', message);
    console.log(`Message sent to room ${room}:`, message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 