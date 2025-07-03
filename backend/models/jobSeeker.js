const mongoose = require("mongoose");

const jobSeekerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String // URL or path to profile image
}, { timestamps: true });

module.exports = mongoose.model("JobSeeker", jobSeekerSchema);
