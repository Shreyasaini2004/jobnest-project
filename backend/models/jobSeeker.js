import mongoose from 'mongoose';

const jobSeekerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  education: {
    type: String,
    default: "",
  },
  experience: {
    type: String,
    default: "",
  },
  skills: {
    type: String,
    default: "",
  },
  embedding: {
    type: [Number],
    default: [],
  }
}, {
  timestamps: true
});

const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

export default JobSeeker;
