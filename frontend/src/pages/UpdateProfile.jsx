import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    address: "",
    password: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/api/user/me');

        console.log("User API response:", res.data);
        if (res.data.success) {
          console.log("User data:", res.data.user);
          setUser({ ...res.data.user, password: "" }); // Kosongkan password untuk keamanan
        }
      } catch (error) {
        console.error("Error fetching user data", error);
        toast.error("Failed to load user data");
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      // Preview the selected image
      const file = e.target.files[0];
      if (file) {
        // Create a URL for the file for preview purposes
        const imageUrl = URL.createObjectURL(file);
        setUser({ 
          ...user, 
          avatarFile: file,  // Store the actual file separately
          avatar: imageUrl   // Use the URL for preview
        });
      }
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Show loading toast
      const loadingToast = toast.loading("Updating profile...");
      
      // Create a regular JSON object instead of FormData
      const userData = {
        name: user.name,
        bio: user.bio || "",
        phone: user.phone || "",
        address: user.address || ""
      };
      
      // Only include password if it's not empty
      if (user.password && user.password.trim() !== "") {
        userData.password = user.password;
        console.log("Including password in update");
      }
      
      // If we have an avatar URL from a previous upload, include it
      if (user.avatar && !user.avatar.startsWith('blob:')) {
        userData.avatar = user.avatar;
      }
      
      console.log("Sending user data for update:", {
        ...userData,
        password: userData.password ? '******' : undefined
      });
      
      // If we have a new avatar file, we'll handle that in a separate step
      const hasNewAvatarFile = !!user.avatarFile;

      // Send the update request with JSON data
      const res = await api.put('/api/user/update', userData);

      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (res.data.success) {
        // If we have a new avatar file, upload it to Cloudinary directly
        if (hasNewAvatarFile) {
          try {
            // Create a loading toast for the avatar upload
            const avatarToast = toast.loading("Uploading profile picture...");
            
            // Upload directly to Cloudinary
            const cloudinaryUrl = await uploadToCloudinary(user.avatarFile);
            
            // Update the user profile with the new avatar URL
            const avatarUpdateRes = await api.put('/api/user/update', {
              avatar: cloudinaryUrl
            });
            
            // Dismiss the loading toast
            toast.dismiss(avatarToast);
            
            if (avatarUpdateRes.data.success) {
              toast.success("Profile picture updated");
              // Update the user state with the new avatar URL
              setUser(prev => ({ ...prev, avatar: cloudinaryUrl }));
            } else {
              toast.error("Failed to update profile picture");
            }
          } catch (avatarError) {
            console.error("Error uploading avatar:", avatarError);
            toast.error("Profile updated but couldn't upload new picture: " + avatarError.message);
          }
        } else {
          toast.success("Profile updated successfully");
        }
        
        console.log("Profile updated:", res.data);
        
        // Clear password field after successful update
        setUser({ ...user, password: "", avatarFile: null });
        
        // Redirect to UserDetail page after successful update
        setTimeout(() => {
          navigate("/user-detail");
        }, 2000); // Slightly longer delay to allow all toasts to be seen
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Get detailed error information
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data?.error || 'Unknown error';
      console.error("Error details:", { message: errorMessage, details: errorDetails });
      
      toast.error(`Failed to update profile: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={user.email}
            placeholder="Email"
            className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
            disabled
          />
          <input
            type="text"
            name="bio"
            value={user.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="phone"
            value={user.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="address"
            value={user.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            placeholder="New Password (optional)"
            className="w-full p-2 border rounded"
          />
          {user.avatar && (
            <img
              src={
                user.avatar ? user.avatar : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || 'User')
              }
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover mx-auto"
            />
          )}

          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            className="w-full bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
