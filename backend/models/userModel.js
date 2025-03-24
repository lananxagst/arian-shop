import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    password: {
      type: String,
      validate: {
        validator: function (value) {
          // Password harus ada jika tidak menggunakan Google Login
          return this.googleId || value;
        },
        message: "Password is required.",
      },
    },
    googleId: { type: String, default: null },
    avatar: { type: String, default: "" },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
