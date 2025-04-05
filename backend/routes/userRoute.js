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
import { v2 as cloudinary } from "cloudinary";

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
// Configure multer for temporary storage
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

// Filter to only accept image files
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
      
      const updateData = { name, bio, phone, address };
      
      // Upload avatar to Cloudinary if provided
      if (req.file) {
        try {
          // Convert buffer to base64 string for Cloudinary upload
          const fileStr = req.file.buffer.toString('base64');
          const fileType = req.file.mimetype;
          
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(
            `data:${fileType};base64,${fileStr}`,
            {
              resource_type: "image",
              folder: "profile_photos",
              public_id: `user_${userId}_${Date.now()}`
            }
          );
          
          // Save Cloudinary URL to user profile
          updateData.avatar = result.secure_url;
          console.log("Avatar uploaded to Cloudinary:", result.secure_url);
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          return res.status(500).json({
            success: false,
            message: "Error uploading profile photo",
            error: cloudinaryError.message,
          });
        }
      }
      
      // Update password if provided
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
