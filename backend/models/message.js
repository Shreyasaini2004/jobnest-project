// backend/models/message.js

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    index: true 
  },
  author: {
    type: String, 
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String, 
    required: true
  }
}, {
  timestamps: true 
});

const Message = mongoose.model('Message', messageSchema);

export default Message;