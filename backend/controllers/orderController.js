import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

//controller function for placing order using cod method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address: JSON.stringify(address),  // Convert address object to string
      status: "pending",  // Add default status
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
const updateStatus = async (req, res) => {};

export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus };
