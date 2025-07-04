import axios from './axios';
// Import types from the types file
import { User, EmployerSignupData, JobSeekerSignupData, LoginData } from '@/types/user';

// User API with real backend connections
export const userApi = {
  // Get current user profile
  getCurrentUser: async (userId: string, userType: 'employer' | 'job-seeker'): Promise<User | null> => {
    try {
      // Determine which endpoint to use based on user type
      const endpoint = userType === 'employer' ? 'employer' : 'jobseeker'; // Backend uses 'jobseeker' without hyphen
      const response = await axios.get(`/api/users/${endpoint}/${userId}`);
      
      if (response.data) {
        // Format the response to match the User interface
        const formattedUser = {
          _id: response.data._id,
          name: response.data.firstName && response.data.lastName 
            ? `${response.data.firstName} ${response.data.lastName}` 
            : response.data.name || 'User',
          email: response.data.email,
          userType: userType === 'employer' ? 'employer' : 'job-seeker',
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phone: response.data.phone,
          location: response.data.location,
          experience: response.data.experience,
          education: response.data.education,
          skills: response.data.skills,
          bio: response.data.bio,
          avatar: response.data.avatar,
          createdAt: response.data.createdAt
        };
        console.log('Formatted user data:', formattedUser);
        return formattedUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, userType: 'employer' | 'job-seeker', userData: Partial<User>): Promise<User | null> => {
    try {
      // Determine which endpoint to use based on user type
      const endpoint = userType === 'employer' ? 'employer' : 'jobseeker'; // Backend uses 'jobseeker' without hyphen
      const response = await axios.put(`/api/users/${endpoint}/${userId}`, userData);
      
      if (response.data) {
        // Format the response to match the User interface
        return {
          _id: response.data._id,
          name: response.data.firstName && response.data.lastName 
            ? `${response.data.firstName} ${response.data.lastName}` 
            : response.data.name || 'User',
          email: response.data.email,
          userType: userType === 'employer' ? 'employer' : 'job-seeker',
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phone: response.data.phone,
          location: response.data.location,
          experience: response.data.experience,
          education: response.data.education,
          skills: response.data.skills,
          bio: response.data.bio,
          avatar: response.data.avatar,
          createdAt: response.data.createdAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },

  // Upload user avatar
  uploadAvatar: async (userId: string, userType: 'employer' | 'job-seeker', file: File): Promise<string | null> => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userId);
      formData.append('userType', userType);

      const response = await axios.post('/api/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.avatarUrl) {
        return response.data.avatarUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  },

  // Employer signup
  employerSignup: async (data: EmployerSignupData): Promise<User | null> => {
    try {
      const response = await axios.post('/api/auth/employer/signup', data);
      if (response.data && response.data.user) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error during employer signup:', error);
      throw error;
    }
  },

  // Employer login
  employerLogin: async (data: LoginData): Promise<User | null> => {
    try {
      const response = await axios.post('/api/auth/employer/login', data);
      if (response.data && response.data.user) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error during employer login:', error);
      throw error;
    }
  },

  // Job seeker signup
  jobSeekerSignup: async (data: JobSeekerSignupData): Promise<User | null> => {
    try {
      const response = await axios.post('/api/auth/jobseeker/signup', data);
      if (response.data && response.data.user) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error during job seeker signup:', error);
      throw error;
    }
  },

  // Job seeker login
  jobSeekerLogin: async (data: LoginData): Promise<User | null> => {
    try {
      const response = await axios.post('/api/auth/jobseeker/login', data);
      if (response.data && response.data.user) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error during job seeker login:', error);
      throw error;
    }
  }
};