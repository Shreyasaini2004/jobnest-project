import mongoose from 'mongoose';

const JobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  githubLinkedinUrl: {
    type: String,
  },
  status: {
    type: String,
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);
export default JobApplication;
