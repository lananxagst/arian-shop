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
// Konfigurasi penyimpanan gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Simpan gambar di folder "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

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
      const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

      const updateData = { name, bio, phone, address };
      if (avatar) updateData.avatar = avatar;
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
