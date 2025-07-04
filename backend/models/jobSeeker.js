const mongoose = require("mongoose");

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
  portfolio: String
}, { timestamps: true });

module.exports = mongoose.model("JobSeeker", jobSeekerSchema);
