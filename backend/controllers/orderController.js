import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

//controller function for placing order using cod method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address: address, // Store address as an object directly
      status: "Order Placed",  // Changed from "pending" to match the dropdown options in admin panel
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//controller function for placing order using stripe method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    
    // Create a pending order in the database
    const orderData = {
      userId,
      items,
      amount,
      address: address, // Store address as an object directly
      status: "Order Placed",
      paymentMethod: "Stripe",
      payment: false, // Will be updated to true after successful payment
      date: Date.now(),
    };
    
    const newOrder = new orderModel(orderData);
    await newOrder.save();
    
    // Here you would typically create a Stripe checkout session
    // For now, we'll just simulate a successful payment
    
    // Clear the user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    
    res.json({ 
      success: true, 
      message: "Stripe order created",
      session_url: "/payment-success" // In a real implementation, this would be the Stripe checkout URL
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//controller function for getting all orders data for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//controller function for getting ordres data for client
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//controller function for updating user order status
const updateStatus = async (req, res) => {
  try {
    //getting order id and status from request
    const { orderId, status } = req.body;

    //finding order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }
    
    // If status is "Delivered", check for delivery evidence
    if (status === "Delivered") {
      if (!req.file) {
        return res.json({ 
          success: false, 
          message: "Delivery evidence photo is required when marking an order as delivered" 
        });
      }
      
      try {
        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "delivery_evidence"
        });
        
        // Save the Cloudinary URL to the order
        order.deliveryEvidence = result.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.json({
          success: false,
          message: "Error uploading delivery evidence",
          error: cloudinaryError.message,
        });
      }
    }
    
    // Update order status
    order.status = status;
    await order.save();

    // Fetch the updated order to ensure we have the complete object
    const updatedOrder = await orderModel.findById(orderId);

    // Send response
    return res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }
    
    // Check if order exists
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    
    // Delete the order
    await orderModel.findByIdAndDelete(orderId);
    
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.json({ success: false, message: "Failed to delete order" });
  }
};

export { 
  placeOrder, 
  placeOrderStripe, 
  allOrders, 
  userOrders, 
  updateStatus, 
  deleteOrder 
};
