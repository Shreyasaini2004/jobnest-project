const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['job-seeker', 'employer'], required: true },
  // Employer-specific fields
  companyName: { type: String },
  companyEmail: { type: String },
  jobTitle: { type: String },
  companyWebsite: { type: String },
  companyVerified: { type: Boolean },
  emailVerified: { type: Boolean },
  verifiedCompanyData: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema); 