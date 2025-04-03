import axios from 'axios';

// Get backend URL from environment variables with fallback
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://arianshop-backend.vercel.app';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: backendUrl,
  timeout: 30000, // 30 seconds timeout
});

// Add a request interceptor to handle authentication and FormData
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Special handling for FormData (file uploads)
    if (config.data instanceof FormData) {
      // Let the browser set the correct Content-Type with boundary
      delete config.headers['Content-Type'];
      
      // Log the request for debugging
      console.log(`${config.method.toUpperCase()} request to ${config.url} with FormData`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
