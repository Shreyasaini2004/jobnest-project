const mongoose = require("mongoose");

const jobSeekerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String
}, { timestamps: true });

module.exports = mongoose.model("JobSeeker", jobSeekerSchema);
