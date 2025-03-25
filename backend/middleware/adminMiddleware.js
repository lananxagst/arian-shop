import userModel from "../models/userModel.js";

// Middleware to check if user is an admin
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Check if user is admin (assuming there's an isAdmin field in your user model)
    // If your user model doesn't have an isAdmin field, you can check by email
    if (req.user.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Not authorized as an admin",
      });
    }
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default adminMiddleware;
