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

// Simple endpoint for updating user profile without avatar
userRouter.put(
  "/update",
  authMiddleware,
  express.json(),
  async (req, res) => {
    try {
      const { name, bio, phone, address, password, avatar } = req.body;
      const userId = req.user.id;
      
      console.log('Update profile request received:', { 
        userId,
        name,
        hasPassword: !!password,
        hasAvatar: !!avatar,
        avatarValue: avatar
      });
      
      // Initialize updateData with the form fields
      const updateData = { name };
      
      // Only add fields if they are provided
      if (bio !== undefined) updateData.bio = bio;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      
      // Handle avatar specially to ensure Cloudinary URLs are saved correctly
      if (avatar !== undefined) {
        console.log('Avatar update requested with value:', avatar);
        
        // If it's a Cloudinary URL, use it directly
        if (typeof avatar === 'string' && avatar.includes('cloudinary.com')) {
          console.log('Saving Cloudinary URL to user profile:', avatar);
          updateData.avatar = avatar;
        } else if (avatar) {
          // For other values, save as is
          updateData.avatar = avatar;
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
