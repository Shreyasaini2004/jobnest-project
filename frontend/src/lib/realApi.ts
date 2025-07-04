import axios from './axios';
import { Job } from '@/contexts/SavedJobsContext';
import { Event } from '@/contexts/EventContext';

// Job API with real backend connections
export const jobApi = {
  // Get all jobs
  getJobs: async (): Promise<Job[]> => {
    try {
      const response = await axios.get('/api/jobs/all');
      return response.data.map((job: any) => ({
        id: job._id,
        title: job.jobTitle,
        company: job.postedBy?.companyName || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salaryRange || 'Competitive',
        type: job.jobType || 'Full-time',
        posted: formatPostedDate(job.createdAt),
        description: job.description || '',
        skills: job.requirements ? job.requirements.split(',').map((skill: string) => skill.trim()) : [],
        featured: false,
        deadline: job.deadline ? new Date(job.deadline) : undefined
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },
  
  // Search jobs with filters
  searchJobs: async (searchTerm: string, jobType: string, location: string): Promise<Job[]> => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (jobType && jobType !== 'all') params.append('jobType', jobType);
      if (location && location !== 'all') params.append('location', location);
      
      const response = await axios.get(`/api/jobs/search/filters?${params.toString()}`);
      
      return response.data.map((job: any) => ({
        id: job._id,
        title: job.jobTitle,
        company: job.postedBy?.companyName || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salaryRange || 'Competitive',
        type: job.jobType || 'Full-time',
        posted: formatPostedDate(job.createdAt),
        description: job.description || '',
        skills: job.requirements ? job.requirements.split(',').map((skill: string) => skill.trim()) : [],
        featured: false,
        deadline: job.deadline ? new Date(job.deadline) : undefined
      }));
    } catch (error) {
      console.error('Error searching jobs:', error);
      return [];
    }
  },
  
  // Get job by ID
  getJobById: async (id: string): Promise<Job | null> => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      const job = response.data;
      
      return {
        id: job._id,
        title: job.jobTitle,
        company: job.postedBy?.companyName || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salaryRange || 'Competitive',
        type: job.jobType || 'Full-time',
        posted: formatPostedDate(job.createdAt),
        description: job.description || '',
        skills: job.requirements ? job.requirements.split(',').map((skill: string) => skill.trim()) : [],
        featured: false,
        deadline: job.deadline ? new Date(job.deadline) : undefined
      };
    } catch (error) {
      console.error('Error fetching job details:', error);
      return null;
    }
  },
  
  // Get featured jobs
  getFeaturedJobs: async (): Promise<Job[]> => {
    try {
      const response = await axios.get('/api/jobs/featured');
      
      return response.data.map((job: any) => ({
        id: job._id,
        title: job.jobTitle,
        company: job.postedBy?.companyName || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salaryRange || 'Competitive',
        type: job.jobType || 'Full-time',
        posted: formatPostedDate(job.createdAt),
        description: job.description || '',
        skills: job.requirements ? job.requirements.split(',').map((skill: string) => skill.trim()) : [],
        featured: true,
        deadline: job.deadline ? new Date(job.deadline) : undefined
      }));
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
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
        resumeUrl: application.resumeUrl
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
  
  // Note: Job seeker applications functionality moved to applicationApi.ts
};

// Helper function to format posted date
function formatPostedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
}

// Event API with real backend connections
// Note: This is a placeholder for future implementation
// Currently using the mock implementation from api.ts
export const eventApi = {
  // Placeholder for real API implementation
};