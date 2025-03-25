import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  allOrders,
  placeOrder,
  userOrders,
  updateStatus, // ai changes
} from "../controllers/orderController.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

//  for admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus); // ai changes

// for payment
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrder);

//for user
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
