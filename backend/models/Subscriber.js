import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: String,
    enum: ["monthly", "yearly"],
    default: "monthly",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  validTill: {
    type: Date,
    default: null,
  },
  referenceId: {
    type: String,
    default: null, // Will store Razorpay payment ID
  },
});

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
