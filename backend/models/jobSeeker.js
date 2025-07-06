import mongoose from "mongoose";

const jobSeekerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ Profile form fields
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

const JobSeeker = mongoose.model("JobSeeker", jobSeekerSchema);
export default JobSeeker;
