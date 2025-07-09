// controllers/jobSeekerController.js
import JobSeeker from "../models/jobSeeker.js";

export const getJobSeekerProfile = async (req, res) => {
  try {
    const jobseeker = await JobSeeker.findById(req.params.id);
    if (!jobseeker) {
      return res.status(404).json({ message: "Jobseeker not found" });
    }
    res.status(200).json(jobseeker);
  } catch (error) {
    console.error("Error fetching jobseeker profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
