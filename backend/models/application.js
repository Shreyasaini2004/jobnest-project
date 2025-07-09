import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'rejected', 'shortlisted', 'hired'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  resumeScore: {
    type: Number,
    default: null
  },
  experience: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a job seeker can only apply once to a specific job
applicationSchema.index({ jobSeeker: 1, job: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;