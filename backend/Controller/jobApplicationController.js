// GET /api/applications/recruiter?jobTitle=Frontend Developer
import JobApplication from '../models/JobApplication.js';

export const getApplicationsByRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user._id; // assuming recruiter is logged in
    const jobTitleFilter = req.query.jobTitle; // e.g., "Frontend Developer"

    // Step 1: Find applications by postedBy
    let query = JobApplication.find({ postedBy: recruiterId })
      .populate('jobId') // Step 2: populate job details
      .sort({ appliedAt: -1 });

    const applications = await query.exec();

    // Step 3: Filter by job title (if filter is present)
    const filteredApplications = jobTitleFilter
      ? applications.filter(app => app.jobId?.jobTitle?.toLowerCase() === jobTitleFilter.toLowerCase())
      : applications;

    res.status(200).json(filteredApplications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
