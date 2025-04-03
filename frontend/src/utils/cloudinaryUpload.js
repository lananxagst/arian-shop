/**
 * Utility for direct Cloudinary uploads from the frontend
 */

// Your Cloudinary cloud name - should be stored in environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
// Unsigned upload preset - create this in your Cloudinary dashboard
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

/**
 * Uploads an image file directly to Cloudinary from the frontend
 * 
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path in Cloudinary
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadToCloudinary = async (file, folder = 'user-avatars') => {
  try {
    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Log the upload attempt
    console.log(`Uploading file to Cloudinary: ${file.name} (${file.size} bytes)`);
    
    // Make the upload request
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    
    // Return the secure URL of the uploaded image
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
