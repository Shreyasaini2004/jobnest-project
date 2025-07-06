import mongoose from 'mongoose';

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
    ref: 'Employer', // Must match your Employer model name
    required: true,
  },
  embedding: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
