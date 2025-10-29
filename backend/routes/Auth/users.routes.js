// routes/admin/users.routes.js
import express from "express";
import User from "../../models/User.js";
import Subscriber from "../../models/Subscriber.js";
import { verifyAdmin } from "../../middleware/auth.js";
import nodemailer from "nodemailer";
import admin from "firebase-admin"; // ✅ Firebase Admin SDK

const router = express.Router();

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ GET /api/admin/users
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ DELETE /api/admin/users/:id
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    // 1️⃣ Delete from MongoDB
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const deletionDate = new Date().toLocaleString();

    // 2️⃣ Delete from Subscribers (if any)
    await Subscriber.findOneAndDelete({ email: user.email });

    // 3️⃣ Delete from Firebase Auth (if exists)
    try {
      const firebaseUser = await admin.auth().getUserByEmail(user.email);
      if (firebaseUser) {
        await admin.auth().deleteUser(firebaseUser.uid);
        console.log(`🔥 Firebase user deleted: ${user.email}`);
      }
    } catch (firebaseErr) {
      console.warn(`⚠️ Firebase user not found or already deleted: ${user.email}`);
    }

    // 4️⃣ Send notification email (async — non-blocking)
    const mailOptions = {
      from: `"AS_Ecommerce" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Important: Your Account Has Been Deleted",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; background: #f9f9f9;">
          <h2 style="color: #d32f2f;">Account Deletion Notice</h2>
          <p>Hello <strong>${user.firstName || user.email}</strong>,</p>
          <p>Your account on <strong>AS_Ecommerce</strong> has been permanently deleted by the admin on <strong>${deletionDate}</strong>.</p>
          <p><strong>Reason:</strong> Violation of terms or administrative decision.</p>
          <p>If you believe this was an error, please contact support:</p>
          <p>📧 <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a><br/>📞 +91-7092085864</p>
          <hr />
          <p style="font-size: 14px; color: #555;">Regards,<br><strong>AS_Ecommerce Team</strong></p>
        </div>
      `,
    };

    // Send email but don’t block the main response
    transporter
      .sendMail(mailOptions)
      .then(() => console.log(`✅ Deletion email sent to ${user.email}`))
      .catch((err) => console.error("❌ Error sending deletion email:", err));

    // 5️⃣ Send success response immediately
    return res.status(200).json({
      success: true,
      message: `✅ User ${user.email} deleted successfully (MongoDB + Firebase + Subscription). Email notification sent.`,
    });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    return res.status(500).json({
      success: false,
      message: "User deletion failed",
      error: err.message,
    });
  }
});

export default router;
