/**
 * Helper function to handle image URLs from different sources
 * 
 * This function handles multiple types of image URLs:
 * 1. Full URLs (starting with http/https) - returned as is
 * 2. Cloudinary URLs - returned as is
 * 3. Local paths (starting with /uploads) - handled based on environment
 * 4. User IDs - generates an avatar URL using UI Avatars service
 * 
 * @param {string} imagePath - The image path or URL
 * @param {string} userName - Optional user name for generating avatar fallbacks
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imagePath, userName = 'User') => {
  // Default fallback is a generated avatar based on user name
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=150`;
  
  if (!imagePath) {
    return fallbackImage;
  }
  
  // If it's already a full URL (Cloudinary or other external URL)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local path (from uploads directory)
  if (imagePath.startsWith('/uploads')) {
    // Extract the user ID from the path if possible
    const userIdMatch = imagePath.match(/\/uploads\/([^-]+)/);
    const userId = userIdMatch ? userIdMatch[1] : '';
    
    // Check if we're in production (Vercel)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://arianshop-backend.vercel.app';
    if (backendUrl.includes('vercel.app')) {
      // In production, we can't access local files, so use a fallback
      console.warn('Local image path detected in production. Using fallback image:', imagePath);
      
      // If we have a user ID, try to use a consistent avatar
      if (userId) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=150&seed=${userId}`;
      }
      return fallbackImage;
    }
    
    // In development, we can use the local path
    return `${backendUrl}${imagePath}`;
  }
  
  // Default fallback
  return fallbackImage;
};
