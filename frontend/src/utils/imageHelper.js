/**
 * Helper function to handle image URLs from different sources
 * 
 * This function handles three types of image URLs:
 * 1. Full URLs (starting with http/https) - returned as is
 * 2. Local paths (starting with /uploads) - prepended with backend URL
 * 3. Cloudinary URLs - returned as is
 * 
 * @param {string} imagePath - The image path or URL
 * @param {string} fallbackImage - Optional fallback image if the path is invalid
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imagePath, fallbackImage = 'https://dummyimage.com/150') => {
  if (!imagePath) {
    return fallbackImage;
  }
  
  // If it's already a full URL (Cloudinary or other external URL)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local path (from uploads directory)
  if (imagePath.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://arianshop-backend.vercel.app';
    // For Vercel deployment, these images won't exist, so return fallback
    if (backendUrl.includes('vercel.app')) {
      console.warn('Local image path detected in production. Using fallback image:', imagePath);
      return fallbackImage;
    }
    return `${backendUrl}${imagePath}`;
  }
  
  // Default fallback
  return fallbackImage;
};
