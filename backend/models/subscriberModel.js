import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    lastEmailSent: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;
