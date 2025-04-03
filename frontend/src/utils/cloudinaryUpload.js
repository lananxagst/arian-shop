/**
 * Utility for direct Cloudinary uploads from the frontend
 */

// Your Cloudinary cloud name - should be stored in environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
// Unsigned upload preset - create this in your Cloudinary dashboard
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Check if Cloudinary configuration is available
const isCloudinaryConfigured = CLOUD_NAME && UPLOAD_PRESET;

/**
 * Uploads an image file directly to Cloudinary from the frontend
 * 
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path in Cloudinary
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadToCloudinary = async (file, folder = 'user-avatars') => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured) {
      console.error('Cloudinary configuration missing. Please check your environment variables.');
      throw new Error('Cloudinary upload failed: Missing configuration. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your environment variables.');
    }
    
    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Log the upload attempt with configuration details
    console.log(`Uploading file to Cloudinary: ${file.name} (${file.size} bytes)`);
    console.log(`Using cloud name: ${CLOUD_NAME}, upload preset: ${UPLOAD_PRESET}`);
    
    // Make the upload request
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
        console.error('Cloudinary error details:', errorData);
      } catch {
        // If we can't parse the error response as JSON, use the status text
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
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
