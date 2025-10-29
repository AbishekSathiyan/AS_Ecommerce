// routes/Auth/subscribe.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Subscriber from "../../models/Subscriber.js";
import nodemailer from "nodemailer";
import { verifyAdmin } from "../../middleware/auth.js";

const router = express.Router();

// -------------------- RAZORPAY SETUP --------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------- NODEMAILER SETUP --------------------
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// -------------------- PUBLIC ROUTES --------------------

// 1️⃣ Pre-check subscription
router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const subscriber = await Subscriber.findOne({ email });
  res.status(200).json({ subscribed: !!subscriber });
});

// 2️⃣ Create Razorpay order
router.post("/create-order", async (req, res) => {
  const { plan, amount, email, date, validTill } = req.body;
  try {
    const orderAmount = amount || (plan === "monthly" ? 29900 : 299900);
    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        email,
        plan,
        date: date || new Date().toISOString(),
        validTill: validTill || null,
      },
    });
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

// 3️⃣ Verify payment and save subscriber
router.post("/verify-payment", async (req, res) => {
  const {
    email,
    plan,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = req.body;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature)
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber)
      return res
        .status(409)
        .json({ success: false, message: "Already subscribed" });

    // Calculate validity
    const validTillDate =
      plan === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Save new subscriber
    await new Subscriber({
      email,
      paid: true,
      plan,
      date: new Date(),
      validTill: validTillDate,
      referenceId: razorpay_payment_id,
    }).save();

    // Send confirmation email
    transporter.sendMail(
      {
        from: `"AS Ecommerce" <${
          process.env.ADMIN_EMAILS || process.env.EMAIL_USER
        }>`,
        to: email,
        subject: "🎉 Welcome to AS Ecommerce – Subscription Confirmed!",
        html: `<h2>Welcome ${email}!</h2><p>Your subscription is active. Reference ID: <b>${razorpay_payment_id}</b></p>`,
      },
      (err) =>
        err
          ? console.error("Email failed:", err)
          : console.log("✨ Subscription email sent")
    );

    res.status(201).json({
      success: true,
      message: "Subscription successful! Confirmation email sent.",
      referenceId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
});

// -------------------- ADMIN-ONLY ROUTES --------------------
// ✅ These must be OUTSIDE verify-payment!

// Get all subscribers
router.get("/admin/subscribers", verifyAdmin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ date: -1 });
    const formatted = subscribers.map((sub, index) => ({
      index: index + 1,
      email: sub.email,
      paid: sub.paid,
      plan: sub.plan,
      date: sub.date?.toISOString() || null,
      validTill: sub.validTill?.toISOString() || null,
      referenceId: sub.referenceId || "N/A",
      id: sub._id,
    }));
    res.status(200).json({ success: true, subscribers: formatted });
  } catch (err) {
    console.error("❌ Fetch subscribers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete subscriber
router.delete("/admin/subscribers/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await Subscriber.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Subscriber not found" });
    res
      .status(200)
      .json({ success: true, message: "Subscriber deleted successfully" });
  } catch (err) {
    console.error("Delete subscriber error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
