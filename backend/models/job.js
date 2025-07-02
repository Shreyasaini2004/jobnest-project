const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    jobType: { type: String, required: true },
  department: String,
  location: String,
  salaryRange: String,
  experience: String,
  deadline: String,
  description: String,
  requirements: String,
  benefits: String,
  registrationFee: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer', // 👈 This must match your Employer model
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Job', jobSchema);
