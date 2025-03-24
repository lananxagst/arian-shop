import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Login User (Email & Password)
const loginUser = async (req, res) => {
  try {
    console.log("Received data:", req.body); // Debug: Cek data yang dikirim dari frontend
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    if (!user.password) {
      return res.json({ success: false, message: "Use Google Login instead" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Register User (Email & Password)
const registerUser = async (req, res) => {
  console.log("Received data:", req.body); // Debug: Cek data yang dikirim dari frontend
  try {
    const { name, email, password } = req.body;
    const exist = await userModel.findOne({ email });

    if (exist) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password && password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Jika tidak ada password (mungkin dari Google)
    let hashedPassword = undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword, // Bisa undefined jika dari Google
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Login dengan Google
const googleLoginUser = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    console.log("Google login request:", req.body); // Tambahkan log ini

    let user = await userModel.findOne({ email });

    console.log("User found in database:", user); // Tambahkan log ini

    if (user) {
      if (!user.googleId) {
        return res.json({
          success: false,
          message:
            "This email is already registered with password. Please login using email & password.",
        });
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      user = new userModel({
        name,
        email,
        googleId,
        password: "", // Kosongkan password karena Google tidak pakai password
        avatar,
      });
      await user.save();
      console.log("New user created:", user); // Tambahkan log ini
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Google login failed" });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASS
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const userDetail = async (req, res) => {
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
};

export { loginUser, registerUser, googleLoginUser, adminLogin };
