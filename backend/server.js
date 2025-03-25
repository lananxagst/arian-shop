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
// const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: "*", // Mengizinkan semua origin (sementara untuk debugging)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true,
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
