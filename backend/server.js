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
connectDB();
connectCloudinary();

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

app.get("/", (req, res) => {
  res.send("API Working");
});
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => console.log("Server is running on PORT : " + PORT));
