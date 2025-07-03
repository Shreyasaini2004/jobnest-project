import axios from 'axios';

// Get backend URL from environment variables or use default
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
console.log('Backend URL configured as:', backendUrl);

// Create axios instance with the backend URL
const axiosInstance = axios.create({
  baseURL: backendUrl,
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(config => {
  console.log('Making request to:', config.baseURL + config.url);
  return config;
});

// Add response interceptor for debugging
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
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;