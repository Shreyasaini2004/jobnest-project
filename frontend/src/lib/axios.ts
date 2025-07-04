import axios from 'axios';
import { logout as userLogout } from '@/contexts/UserContext';

// Get backend URL from environment variables or use default
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
console.log('Backend URL configured as:', backendUrl);

// Create axios instance with the backend URL
const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(config => {
  // No need to manually attach token
  console.log('Making request to:', config.baseURL + config.url);
  return config;
});

// Add response interceptor for debugging and global 401 handling
axiosInstance.interceptors.response.use(
  response => {
    console.log('Response received:', response.status);
    return response;
  },
  error => {
    console.error('Request failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      if (error.response.status === 401) {
        // Global logout and redirect on session expiry
        if (typeof userLogout === 'function') userLogout();
        
        // Get user type from localStorage to determine redirect
        let redirectPath = '/login?expired=1';
        try {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.userType === 'employer') {
              redirectPath = '/employer-login?expired=1';
            } else if (user.userType === 'job-seeker') {
              redirectPath = '/job-seeker-login?expired=1';
            }
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
        
        window.location.href = redirectPath;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;