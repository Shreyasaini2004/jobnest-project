// backend/routes/chat.js

import express from 'express';
import Message from '../models/message.js';

const router = express.Router();

// GET /api/chat/:roomId/history
// Fetches the chat history for a specific room
router.get('/:roomId/history', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 'asc' }); // Get messages in chronological order

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

export default router;