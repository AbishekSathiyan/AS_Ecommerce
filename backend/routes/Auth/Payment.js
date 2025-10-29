import express from "express";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import { adminAuth } from "../../firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --------------------
// Create Razorpay Order or COD
// --------------------
router.post("/create", async (req, res) => {
  try {
    const { cartItems, amount, shippingAddress, paymentMethod = "online" } = req.body;

    if (!cartItems?.length || !amount || !shippingAddress) {
      return res.status(400).json({ success: false, message: "Cart items, amount, and shipping address are required" });
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ success: false, message: "Complete shipping address is required" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });

    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userId = decoded.uid;

    // Enrich cart items
    const itemsWithDetails = await Promise.all(cartItems.map(async (item) => {
      const product = await Product.findById(item._id).select("images name price stock").lean();
      if (!product) throw new Error(`Product not found: ${item._id}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      return {
        product: item._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || "https://dummyimage.com/150x150/cccccc/000000&text=No+Image",
      };
    }));

    const finalPaymentMethod = paymentMethod?.toLowerCase() === "cod" ? "COD" : "Online";
    const shippingPrice = amount >= 499 ? 0 : 40;
    const totalPrice = Number(amount) + shippingPrice;

    if (finalPaymentMethod === "Online" && totalPrice > 99999) {
      return res.status(400).json({ success: false, message: "Amount exceeds limit for online payments. Use COD instead." });
    }

    const orderData = {
      user: userId,
      orderItems: itemsWithDetails,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || "TamilNadu",
        zipCode: shippingAddress.zipCode,
        phone: shippingAddress.phone,
        email: shippingAddress.email || decoded.email,
      },
      paymentMethod: finalPaymentMethod,
      itemsPrice: Number(amount),
      shippingPrice,
      totalPrice,
      isPaid: finalPaymentMethod === "COD" ? false : false,
      paidAt: null,
      isDelivered: false,
      status: "confirmed",
      paymentStatus: finalPaymentMethod === "COD" ? "Pending" : "Pending",
      razorpay_order_id: `ORDER-${uuidv4()}`, // Always generate a unique ID for all orders
    };

    if (finalPaymentMethod === "COD") {
      const codOrder = await Order.create(orderData);
      return res.status(201).json({
        success: true,
        message: "COD order created successfully",
        orderId: codOrder._id,
        rzpOrderId: codOrder.razorpay_order_id,
        order: codOrder
      });
    }

    // Online payment
    const onlineOrder = await Order.create(orderData);

    try {
      const rzpOrder = await razorpayInstance.orders.create({
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        receipt: onlineOrder._id.toString(),
        notes: { orderId: onlineOrder._id.toString(), userId }
      });

      onlineOrder.razorpay_order_id = rzpOrder.id;
      await onlineOrder.save();

      return res.status(200).json({
        success: true,
        rzpOrderId: rzpOrder.id,
        orderId: onlineOrder._id,
        amount: totalPrice
      });
    } catch (rzpError) {
      await Order.findByIdAndUpdate(onlineOrder._id, { status: "failed", paymentStatus: "failed" });
      throw new Error(`Razorpay order creation failed: ${rzpError.message}`);
    }

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to create order", error: process.env.NODE_ENV === 'development' ? err.stack : undefined });
  }
});

// --------------------
// Verify Razorpay Payment
// --------------------
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Incomplete payment data" });
    }

    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) return res.status(400).json({ success: false, message: "Invalid payment signature" });

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Unauthorized" });

    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    const userId = decoded.uid;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.paymentStatus = "Paid";
    order.isPaid = true;
    order.paidAt = new Date();
    order.razorpay_payment_id = razorpay_payment_id;
    order.status = "confirmed";
    await order.save();

    return res.status(200).json({ success: true, message: "Payment verified successfully", order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Payment verification failed" });
  }
});

export default router;
