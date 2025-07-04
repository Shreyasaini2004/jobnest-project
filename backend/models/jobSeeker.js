// models/jobSeeker.js

const mongoose = require("mongoose");

const jobSeekerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ Add these fields for the profile form
    phone: { type: String },
    location: { type: String },
    experience: { type: String },
    education: { type: String },
    skills: { type: String },
    bio: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobSeeker", jobSeekerSchema);
