// models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    minlength: [10, "Message must be at least 10 characters long"],
    maxlength: [1000, "Message cannot exceed 1000 characters"]
  },
  read: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Add indexes for better performance
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ read: 1 });
contactSchema.index({ status: 1 });

export default mongoose.model("Contact", contactSchema);