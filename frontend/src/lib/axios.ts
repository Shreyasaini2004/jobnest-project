import axios from 'axios';
import { logout as userLogout } from '@/contexts/UserContext';

// Get backend URL from environment variables or use default
const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log('Backend URL configured as:', backendUrl);

// Create axios instance with the backend URL
const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for production
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(config => {
  // Log the full URL being called for debugging
  const fullUrl = config.baseURL + config.url;
  console.log('Making request to:', fullUrl);
  
  // Add headers for production
  if (import.meta.env.PROD) {
    config.headers['Content-Type'] = 'application/json';
  }
  
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
    
    // Check if it's a network error (API not available)
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network error - API server may not be running or accessible');
      console.error('Current API URL:', backendUrl);
      console.error('Environment:', import.meta.env.MODE);
    }
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Check if response is HTML instead of JSON (common when API is not available)
      if (error.response.headers['content-type']?.includes('text/html')) {
        console.error('Received HTML instead of JSON - API endpoint may be incorrect or server not running');
      }
      
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
