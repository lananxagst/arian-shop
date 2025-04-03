import express from "express";
import {
  adminLogin,
  googleLoginUser,
  getWishlist,
  loginUser,
  registerUser,
  removeFromWishlist,
  toggleWishlistItem,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/login-google", googleLoginUser);
userRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error di /me:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
// Use memory storage instead of disk storage for Vercel compatibility
const storage = multer.memoryStorage();

// Filter hanya menerima file gambar
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Endpoint untuk update profil dengan avatar
userRouter.put(
  "/update",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { name, bio, phone, address, password } = req.body;
      const userId = req.user.id;
      
      // Initialize updateData with the form fields
      const updateData = { name, bio, phone, address };
      
      // Handle avatar upload to Cloudinary if a file was uploaded
      if (req.file) {
        try {
          console.log('File received:', { 
            fieldname: req.file.fieldname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            hasBuffer: !!req.file.buffer
          });
          
          // Safely handle the buffer
          if (!req.file.buffer) {
            console.error('No buffer found in uploaded file');
            return res.status(400).json({
              success: false,
              message: 'Invalid file upload - no buffer found'
            });
          }
          
          // Convert buffer to base64 string for Cloudinary upload
          const fileBuffer = req.file.buffer;
          const fileStr = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
          
          // Upload to Cloudinary with additional options for better reliability
          const result = await cloudinary.uploader.upload(fileStr, {
            resource_type: "auto",
            folder: "user-avatars",
            overwrite: true,
            unique_filename: true,
            timeout: 60000, // 60 seconds timeout
          });
          
          console.log("Cloudinary upload successful:", {
            public_id: result.public_id,
            url: result.secure_url,
            format: result.format
          });
          
          updateData.avatar = result.secure_url;
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          return res.status(500).json({ 
            success: false, 
            message: "Error uploading avatar image",
            error: cloudinaryError.message || 'Unknown Cloudinary error'
          });
        }
      }
      
      // Hash password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      console.log("User data before sending:", updatedUser); // Debugging

      res.json({
        success: true,
        message: "Profile updated",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Wishlist routes
userRouter.get("/wishlist", authMiddleware, getWishlist);
userRouter.post("/wishlist/toggle", authMiddleware, toggleWishlistItem);
userRouter.post("/wishlist/remove", authMiddleware, removeFromWishlist);

export default userRouter;
