import express from "express";
import mongoose from "mongoose";
import Order from "../../models/Order.js";
import { verifyAdmin } from "../../middleware/auth.js";

const router = express.Router();

// GET all orders
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Fetch admin orders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH order status
router.patch("/:id/delivery-status", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    if (!deliveryStatus) {
      return res.status(400).json({ success: false, message: "deliveryStatus is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const updateFields = { status: deliveryStatus };

    switch (deliveryStatus.toLowerCase()) {
      case "delivered":
        updateFields.isDelivered = true;
        updateFields.deliveredAt = new Date();
        updateFields.isPaid = true;
        updateFields.paidAt = new Date();
        updateFields.paymentStatus = "Paid";
        break;
      case "cancelled":
        updateFields.isDelivered = false;
        updateFields.deliveredAt = null;
        break;
      default:
        updateFields.isDelivered = false;
        updateFields.deliveredAt = null;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Update delivery status error:", err);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
});

export default router;
