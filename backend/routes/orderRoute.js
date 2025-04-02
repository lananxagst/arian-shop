import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import orderController from "../controllers/orderController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const orderRouter = express.Router();

//  for admin
orderRouter.post("/list", adminAuth, orderController.allOrders);
orderRouter.post("/status", adminAuth, upload.single("deliveryEvidence"), orderController.updateStatus); 
orderRouter.post("/delete", adminAuth, orderController.deleteOrder);

// for payment
orderRouter.post("/place", authUser, orderController.placeOrder);
orderRouter.post("/stripe", authUser, orderController.placeOrderStripe);
orderRouter.post("/update-payment", authUser, orderController.updatePaymentStatus);

//for user
orderRouter.post("/userorders", authUser, orderController.userOrders);

export default orderRouter;
