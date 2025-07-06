import mongoose from "mongoose";

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
  avatar: String // URL or path to profile image
}, { timestamps: true });

const Employer = mongoose.model("Employer", employerSchema);
export default Employer;
