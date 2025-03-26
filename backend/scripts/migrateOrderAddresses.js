import mongoose from "mongoose";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const migrateOrderAddresses = async () => {
  try {
    console.log("Starting order address migration...");
    
    // Get all orders
    const orders = await orderModel.find({});
    console.log(`Found ${orders.length} orders to check`);
    
    let migratedCount = 0;
    
    // Process each order
    for (const order of orders) {
      // Check if address is a string (old format)
      if (typeof order.address === 'string') {
        try {
          // Parse the JSON string back to an object
          const addressObject = JSON.parse(order.address);
          
          // Update the order with the parsed address object
          order.address = addressObject;
          await order.save();
          
          migratedCount++;
          console.log(`Migrated order ${order._id}`);
        } catch (parseError) {
          console.error(`Error parsing address for order ${order._id}:`, parseError);
        }
      }
    }
    
    console.log(`Migration complete. Migrated ${migratedCount} orders.`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the migration
migrateOrderAddresses();
