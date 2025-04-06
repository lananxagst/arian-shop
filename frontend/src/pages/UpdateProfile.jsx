import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backend_url } from "../config";

const EditProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backend_url}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      setUser({ ...user, avatar: e.target.files[0] });
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Show loading toast
    const loadingToast = toast.loading("Updating profile...");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("bio", user.bio);
      formData.append("phone", user.phone);
      formData.append("address", user.address);
      
      // Only include password if it's not empty
      if (user.password && user.password.trim() !== "") {
        formData.append("password", user.password);
        console.log("Including password in update");
      }
      
      if (user.avatar instanceof File) {
        formData.append("avatar", user.avatar);
      }

      const res = await axios.put(
        `${backend_url}/api/user/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        // Update the loading toast to success
        toast.update(loadingToast, {
          render: "Profile updated successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
        
        // Clear password field after successful update
        setUser({ ...user, password: "" });
        
        // Redirect to UserDetail page after successful update
        setTimeout(() => {
          navigate("/user-detail");
        }, 1000); // Short delay to allow the toast to be seen
      }
    } catch (error) {
      console.error("Error updating profile", error);
      
      // Update the loading toast to error
      toast.update(loadingToast, {
        render: "Failed to update profile: " + (error.response?.data?.message || error.message),
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
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
                typeof user.avatar === "string"
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${backend_url}${user.avatar}`
                  : URL.createObjectURL(user.avatar) // Preview gambar yang di-upload
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
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
