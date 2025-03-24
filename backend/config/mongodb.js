import mongoose, { connect } from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connect");
  } catch (error) {
    console.log("Databasae connection failed", error.message);
  }
};

export default connectDB;
