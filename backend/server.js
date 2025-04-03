import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import producRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import subscriberRouter from "./routes/subscriberRoutes.js";

// App Config
const app = express();
const PORT = process.env.PORT || 4000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Initialize database connections
try {
  connectDB();
  connectCloudinary();
} catch (error) {
  console.error('Error during initialization:', error);
  // Don't exit in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

// Middleware
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174",
  "https://arian-shop.vercel.app",
  "https://arian-shop-git-main.vercel.app",
  "https://arian-shop-*.vercel.app"
];
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in our allowedOrigins list
      if (allowedOrigins.some(allowedOrigin => {
        // Support wildcard matching for Vercel preview deployments
        if (allowedOrigin.includes('*')) {
          const pattern = new RegExp(allowedOrigin.replace('*', '.*'));
          return pattern.test(origin);
        }
        return allowedOrigin === origin;
      })) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        // For production, we'll still allow all origins for now
        // but you can change this to be more restrictive later
        callback(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true,
    exposedHeaders: ["token"]
  })
);

app.use(express.json());

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", producRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/subscribers", subscriberRouter);

// Root route - simple health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "API Working", status: "success" });
});

// Static files
app.use("/uploads", express.static("uploads"));

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('ERROR 💥', err);
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  res.status(statusCode).json({
    status: status,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥', err.name, err.message);
  console.error(err.stack);
  
  // In production, we log the error but don't crash the server
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Start server only if this file is run directly (not imported)
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  const server = app.listen(PORT, () => console.log("Server is running on PORT : " + PORT));

  // Handle SIGTERM signal (for graceful shutdown in containerized environments)
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
}

// Export the app for serverless environments
export default app;
