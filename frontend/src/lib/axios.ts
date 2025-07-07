import axios from 'axios';
import { logout as userLogout } from '@/contexts/UserContext';

// Get backend URL from environment variables or use default
const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
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


// src/api/axios.ts (or wherever it is) -- CORRECTED

// import axios from 'axios';

// // Get the API base URL from environment variables, with a fallback
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const apiClient = axios.create({
//   baseURL: API_URL,
//   withCredentials: true, // Important for cookies/sessions if you use them
// });

// // Add a request interceptor to automatically add the Authorization token
// // This is the most important part for making authenticated requests work.
// apiClient.interceptors.request.use(
//   (config) => {
//     // Get the token from localStorage on every request
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     // This will handle errors that happen before the request is sent
//     return Promise.reject(error);
//   }
// );

// // We will handle the 401 logout logic inside a component
// // instead of in this file, so we remove the problematic response interceptor.
// // You can add a simple logger if you want.
// apiClient.interceptors.response.use(
//   (response) => {
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     return response;
//   },
//   (error) => {
//     // Any status codes that falls outside the range of 2xx cause this function to trigger
//     // You can add global error logging here if you want.
//     console.error("API Error:", error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// export default apiClient;