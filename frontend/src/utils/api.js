import axios from 'axios';

// Get backend URL from environment variables with fallback
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://arianshop-backend.vercel.app';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: backendUrl,
  timeout: 15000, // Reduce timeout to 15 seconds for faster fallback to cached data
  retries: 1, // Add retry capability
  retryDelay: 1000, // Retry after 1 second
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
    } else {
      // Log regular requests
      console.log(`${config.method?.toUpperCase() || 'GET'} request to ${config.url}`);
    }
    
    // Add request timestamp for timeout tracking
    config.metadata = { startTime: new Date() };
    
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
    // Calculate response time for monitoring
    if (response.config.metadata) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`Response from ${response.config.url} received in ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle retry logic for network errors and timeouts
    if ((error.code === 'ECONNABORTED' || !error.response) && 
        originalRequest && 
        originalRequest.retries > 0) {
      
      originalRequest.retries -= 1;
      console.log(`Retrying request to ${originalRequest.url}, ${originalRequest.retries} retries left`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, originalRequest.retryDelay || 1000));
      
      // Try again with a fresh request
      return api(originalRequest);
    }
    
    // Log different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.log('API No Response:', error.request);
      
      // For timeout errors, provide more specific logging
      if (error.code === 'ECONNABORTED') {
        console.log('Request timed out - consider using cached data if available');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('API Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Add custom methods to the api object
api.getCached = async (url, config = {}) => {
  const cacheKey = `api_cache_${url}`;
  try {
    // Try to get from localStorage first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;
      
      // Use cached data if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        console.log(`Using cached data for ${url}, age: ${cacheAge}ms`);
        return { data, fromCache: true };
      }
    }
    
    // If no valid cache, make the API call
    const response = await api.get(url, config);
    
    // Cache the response
    localStorage.setItem(cacheKey, JSON.stringify({
      data: response.data,
      timestamp: Date.now()
    }));
    
    return { data: response.data, fromCache: false };
  } catch (error) {
    console.error(`Error in getCached for ${url}:`, error);
    
    // If API call fails, try to use cached data regardless of age
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      console.log(`Falling back to cached data for ${url} after error`);
      return { data, fromCache: true, error };
    }
    
    // If no cached data available, rethrow the error
    throw error;
  }
};

export default api;
