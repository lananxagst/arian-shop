// This file is specifically for Vercel serverless deployment
import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from "../config/mongodb.js";
import connectCloudinary from "../config/cloudinary.js";
import userRouter from "../routes/userRoute.js";
import producRouter from "../routes/productRoute.js";
import cartRouter from "../routes/cartRoute.js";
import orderRouter from "../routes/orderRoute.js";
import subscriberRouter from "../routes/subscriberRoutes.js";

// Initialize Express app
const app = express();

// Connect to database
try {
  connectDB();
  connectCloudinary();
} catch (error) {
  console.error('Error during initialization:', error);
}

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "x-requested-with"],
  credentials: true,
  exposedHeaders: ["token"]
}));

// Body parser
app.use(express.json());

// API Routes
app.use("/api/user", userRouter);
app.use("/api/product", producRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/subscribers", subscriberRouter);

// Root route for health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "API Working", status: "success" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Export the serverless function handler
export default async function handler(req, res) {
  return app(req, res);
}
