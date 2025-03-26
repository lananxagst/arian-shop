import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  allOrders,
  placeOrder,
  userOrders,
  updateStatus,
  deleteOrder, 
} from "../controllers/orderController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const orderRouter = express.Router();

//  for admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, upload.single("deliveryEvidence"), updateStatus); 
orderRouter.post("/delete", adminAuth, deleteOrder);

// for payment
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrder);

//for user
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
