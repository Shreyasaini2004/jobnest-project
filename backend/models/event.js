const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['job-fair', 'webinar', 'other'], required: true },
  description: { type: String },
  meetingLink: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema); 