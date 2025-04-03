import axios from 'axios';

// Get backend URL from environment variables with fallback
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://arianshop-backend.vercel.app';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: backendUrl,
});

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
