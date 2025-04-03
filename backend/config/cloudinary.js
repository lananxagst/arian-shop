import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLDN_NAME || 'default',
  api_key: process.env.CLDN_API_KEY || '',
  api_secret: process.env.CLDN_API_SECRET || '',
});

// Log a warning if environment variables are missing
if (!process.env.CLDN_NAME || !process.env.CLDN_API_KEY || !process.env.CLDN_API_SECRET) {
  console.warn('Warning: Cloudinary environment variables are not properly defined');
}

// Initialize Cloudinary connection
const connectCloudinary = async () => {
  try {
    // Check if all required environment variables are defined
    if (!process.env.CLDN_NAME || !process.env.CLDN_API_KEY || !process.env.CLDN_API_SECRET) {
      throw new Error('Cloudinary environment variables are not properly defined');
    }
    
    console.log('Cloudinary configured successfully');
    
    // Test the connection by making a simple API call
    // Uncomment this if you want to verify the connection works
    // const result = await cloudinary.api.ping();
    // console.log('Cloudinary connection test:', result);
  } catch (error) {
    console.error('Cloudinary configuration failed:', error.message);
    // Don't exit the process in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Export both the connection function and the cloudinary instance
export { connectCloudinary };
export default cloudinary;
