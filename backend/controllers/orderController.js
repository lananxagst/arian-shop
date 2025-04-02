import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";

//global variable for payment
const currency = "idr"
const diliveryCharges = 10
const minimumAmountInIDR = 10000 // Minimum amount in IDR (approximately 0.65 USD)
const stripeUnitConversion = 100 // Convert IDR to sen (1 IDR = 100 sen)

//gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const {origin} = req.headers;
    
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
    const savedOrder = await newOrder.save();
    
    // Create line items for Stripe
    const line_items = items.map(item => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.images && item.images.length > 0 ? [item.images[0]] : [],
        },
        // The price is already multiplied by 1000 from the frontend
        // For Stripe, we need to convert to the smallest currency unit (sen)
        // 1 IDR = 100 sen, so we need to multiply by 100
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity
    }));
    
    // Add delivery charges as a separate line item if applicable
    if (diliveryCharges > 0) {
      line_items.push({
        price_data: {
          currency: currency,
          product_data: {
            name: "Delivery Charges",
          },
          // Delivery charges are also multiplied by 1000 from the frontend
          // Then multiply by 100 to convert to sen
          unit_amount: Math.round(diliveryCharges * 1000 * 100),
        },
        quantity: 1
      });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${origin}/payment-success?order_id=${savedOrder._id}`,
      cancel_url: `${origin}/payment-cancel?order_id=${savedOrder._id}`,
      metadata: {
        order_id: savedOrder._id.toString()
      }
    });
    
    // Don't clear the cart until payment is successful
    // We'll handle this in the payment success webhook or callback
    
    res.json({ 
      success: true, 
      message: "Stripe checkout session created",
      session_url: session.url
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

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;
    
    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }
    
    // Check if order exists
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    
    // Update payment status
    order.payment = paymentStatus;
    await order.save();
    
    // Fetch the updated order to ensure we have the complete object
    const updatedOrder = await orderModel.findById(orderId);
    
    res.json({ 
      success: true, 
      message: "Payment status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.json({ success: false, message: "Failed to update payment status" });
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

export default {
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
  updatePaymentStatus
};
