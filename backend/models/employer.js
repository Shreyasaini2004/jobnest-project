const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  companyName: String,
  companyEmail: String,
  jobTitle: String,
  companyWebsite: String,
  password: String,
  role: {
    type: String,
    default: "employer"
  },
  avatar: String, // URL or path to profile image
  interests: [String],
  jobTypes: [String],
  industries: [String],
  languages: [String],
  certifications: [String],
  portfolio: String,
  bio: String,
  experience: String,
  education: String,
  skills: String
}, { timestamps: true });

module.exports = mongoose.model("Employer", employerSchema);
