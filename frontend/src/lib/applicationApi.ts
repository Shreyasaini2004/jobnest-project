import axios from './axios';

// Application API with real backend connections
export const applicationApi = {
  // Get all applications for a job seeker
  getJobSeekerApplications: async (jobSeekerId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`/api/applications/job-seeker/${jobSeekerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job seeker applications:', error);
      return [];
    }
  },

  // Apply for a job
  applyForJob: async (jobId: string, application: any): Promise<boolean> => {
    try {
      const response = await axios.post('/api/applications/apply', {
        jobId,
        jobSeekerId: application.jobSeekerId,
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl,
        experience: application.experience || '',
        location: application.location || '',
        education: application.education || '',
        resumeScore: application.resumeScore || null
      });
      
      return response.status === 201;
    } catch (error) {
      console.error('Error applying for job:', error);
      return false;
    }
  },

  // Check if user has applied to a job
  checkJobApplication: async (jobId: string, jobSeekerId: string): Promise<{hasApplied: boolean, application: any}> => {
    try {
      const response = await axios.get(`/api/applications/check/${jobId}/${jobSeekerId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking job application:', error);
      return { hasApplied: false, application: null };
    }
  },

  // Update application status (for employers)
  updateApplicationStatus: async (applicationId: string, status: string): Promise<any> => {
    try {
      const response = await axios.put(`/api/applications/${applicationId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      return null;
    }
  },

  // Get all applications for a specific job (for employers)
  getJobApplications: async (jobId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`/api/applications/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      return [];
    }
  }
};