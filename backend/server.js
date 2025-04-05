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

// Create a custom CORS middleware function
const corsMiddleware = (req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Set default CORS headers for all responses
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, x-requested-with, x-http-method-override');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    res.header('Access-Control-Expose-Headers', 'token');
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      res.header('Access-Control-Allow-Origin', origin || '*');
      return res.status(204).end();
    }
    
    // In production, check against allowed origins
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // For now, allow all origins in production too
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    return res.status(204).end();
  }
  
  // For non-OPTIONS requests
  if (origin) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.includes(origin)) {
      // In production, check against allowed origins
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // For now, allow all origins in production too
      res.header('Access-Control-Allow-Origin', origin);
      console.log("Allowed non-listed origin:", origin);
    }
  }
  
  next();
};

// Apply our custom CORS middleware to all routes
app.use(corsMiddleware);

// Also use the cors package as a backup
app.use(cors({
  origin: true, // Reflect the request origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "x-requested-with", "x-http-method-override"],
  exposedHeaders: ["token"],
  maxAge: 86400
}));

// Enable pre-flight for all routes
app.options('*', (req, res) => {
  res.status(204).end();
});

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
// Using import.meta.url to check if this is the main module (ES modules approach)
if (process.env.NODE_ENV !== 'production' || import.meta.url.endsWith('server.js')) {
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
