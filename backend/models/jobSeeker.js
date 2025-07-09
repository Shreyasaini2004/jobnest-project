import mongoose from 'mongoose';

const jobSeekerSchema = new mongoose.Schema({

  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String, // Cloudinary URL for profile image
  phone: String,
  location: String,
  experience: String,
  education: String,
  skills: String,
  bio: String,
  interests: [String],
  jobTypes: [String],
  industries: [String],
  languages: [String],
  certifications: [String],
  portfolio: String,
  embedding: {
    type: [Number],
    default: [],
  }
}, { timestamps: true });

const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

export default JobSeeker;
