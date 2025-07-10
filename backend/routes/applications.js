import express from 'express';
import mongoose from 'mongoose';
import Application from '../models/application.js';
import JobApplication from '../models/ApplicationForm.js';
import Job from '../models/job.js';
import JobSeeker from '../models/jobSeeker.js';

const router = express.Router();

// Apply for a job - Original route for JobSeeker model
router.post('/apply', async (req, res) => {
  try {
    const { jobId, jobSeekerId, coverLetter, resumeUrl, experience, location, education, resumeScore } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(jobSeekerId)) {
      return res.status(400).json({ error: 'Invalid job or job seeker ID format' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job seeker exists
    const jobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ error: 'Job seeker not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ job: jobId, jobSeeker: jobSeekerId });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Create new application
    const application = new Application({
      job: jobId,
      jobSeeker: jobSeekerId,
      coverLetter,
      resumeUrl,
      resumeScore,
      experience,
      location,
      education
    });

    const savedApplication = await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application: savedApplication
    });
  } catch (err) {
    console.error('❌ Error applying for job:', err.message);
    res.status(500).json({ error: 'Failed to submit application', details: err.message });
  }
});

// New route for ApplicationForm model and JobSeeker model (accepts both payloads)
router.post('/', async (req, res) => {
  try {
    // If jobSeekerId is present, treat as JobSeeker application
    if (req.body.jobSeekerId) {
      const { jobId, jobSeekerId, coverLetter, resumeUrl, experience, location, education, resumeScore } = req.body;

      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(jobSeekerId)) {
        return res.status(400).json({ error: 'Invalid job or job seeker ID format' });
      }

      // Check if job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check if job seeker exists
      const jobSeeker = await JobSeeker.findById(jobSeekerId);
      if (!jobSeeker) {
        return res.status(404).json({ error: 'Job seeker not found' });
      }

      // Check if already applied
      const existingApplication = await Application.findOne({ job: jobId, jobSeeker: jobSeekerId });
      if (existingApplication) {
        return res.status(400).json({ error: 'You have already applied for this job' });
      }

      // Create new application
      const application = new Application({
        job: jobId,
        jobSeeker: jobSeekerId,
        coverLetter,
        resumeUrl,
        resumeScore,
        experience,
        location,
        education
      });

      const savedApplication = await application.save();

      return res.status(201).json({
        message: 'Application submitted successfully',
        application: savedApplication
      });
    }
    // Otherwise, treat as recruiter application (JobApplication model)
    else {
      const {
        jobId,
        postedBy,
        name,
        phoneNumber,
        email,
        coverLetter,
        resumeUrl,
        githubLinkedinUrl,
      } = req.body;

      // Validate required fields
      if (!jobId || !postedBy || !name || !phoneNumber || !email || !coverLetter || !resumeUrl) {
        console.error("Missing required fields:", req.body);
        return res.status(400).json({ error: "All required fields must be provided." });
      }

      // Confirm job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Create application
      const newApplication = new JobApplication({
        job: jobId,
        postedBy,
        name,
        phoneNumber,
        email,
        coverLetter,
        resumeUrl,
        githubLinkedinUrl
      });

      await newApplication.save();

      return res.status(201).json({ message: "Application submitted successfully" });
    }
  } catch (err) {
    console.error("Error creating application:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// Get all applications for a specific job seeker
router.get('/job-seeker/:jobSeekerId', async (req, res) => {
  try {
    const { jobSeekerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobSeekerId)) {
      return res.status(400).json({ error: 'Invalid job seeker ID format' });
    }

    const applications = await Application.find({ jobSeeker: jobSeekerId })
      .populate('job', 'jobTitle jobType location salaryRange postedBy')
      .populate('job.postedBy', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    console.error('❌ Error fetching applications:', err.message);
    res.status(500).json({ error: 'Failed to fetch applications', details: err.message });
  }
});

// Get all applications for a specific job
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('jobSeeker', 'firstName lastName email avatar phone experience location education skills')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    console.error('❌ Error fetching job applications:', err.message);
    res.status(500).json({ error: 'Failed to fetch job applications', details: err.message });
  }
});

// Get all applications for a recruiter (from ApplicationForm model)
router.get('/', async (req, res) => {
  try {
    const { postedBy, jobId } = req.query;

    if (!postedBy) {
      return res.status(400).json({ error: "Missing postedBy (recruiterId) in query" });
    }

    const filter = { postedBy };
    if (jobId) {
      filter.job = jobId;
    }

    const applications = await JobApplication.find(filter)
      .populate("job")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Update application status (for employers)
router.put('/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID format' });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'rejected', 'shortlisted', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json(updatedApplication);
  } catch (err) {
    console.error('❌ Error updating application status:', err.message);
    res.status(500).json({ error: 'Failed to update application status', details: err.message });
  }
});

// Check if a job seeker has applied to a specific job
router.get('/check/:jobId/:jobSeekerId', async (req, res) => {
  try {
    const { jobId, jobSeekerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(jobSeekerId)) {
      return res.status(400).json({ error: 'Invalid job or job seeker ID format' });
    }

    const application = await Application.findOne({ job: jobId, jobSeeker: jobSeekerId });
    
    res.status(200).json({
      hasApplied: !!application,
      application: application || null
    });
  } catch (err) {
    console.error('❌ Error checking application status:', err.message);
    res.status(500).json({ error: 'Failed to check application status', details: err.message });
  }
});

export default router;
