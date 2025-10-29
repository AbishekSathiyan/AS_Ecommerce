// routes/Auth/Profile.js
import express from "express";
import { verifyToken } from "../../middleware/auth.js";
import User from "../../models/User.js";
import Subscriber from "../../models/Subscriber.js";

const router = express.Router();

/**
 * GET /api/auth/profile
 * Fetch logged-in user's profile + subscription
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching profile for firebaseuid:", req.user.uid);

    // 1️⃣ Try finding user by firebaseuid
    let user = await User.findOne({ firebaseuid: req.user.uid });

    // 2️⃣ If not found, try finding by email
    if (!user) {
      console.log("User not found by firebaseuid, trying by email:", req.user.email);
      user = await User.findOne({ email: req.user.email });
    }

    // 3️⃣ If still not found → user deleted
    if (!user) {
      console.warn(`⚠️ User not found in DB: ${req.user.email}`);
      return res.status(404).json({ message: "User Deleted" });
    }

    // 4️⃣ Fix missing firebaseuid if found by email
    if (!user.firebaseuid) {
      user.firebaseuid = req.user.uid;
      await user.save();
      console.log("✅ Fixed firebaseuid for existing user:", user.firebaseuid);
    }

    // 5️⃣ Fetch subscription info
    const subscription = await Subscriber.findOne({ email: user.email });

    const responseData = {
      ...user.toObject(),
      subscription: subscription
        ? {
            paid: subscription.paid,
            plan: subscription.plan,
            validTill: subscription.validTill,
            referenceId: subscription.referenceId,
          }
        : null,
    };

    res.json(responseData);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PUT /api/auth/profile
 * Update logged-in user's profile
 */
router.put("/", verifyToken, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.email; // Prevent email modification

    // 1️⃣ Try finding user by firebaseuid
    let user = await User.findOne({ firebaseuid: req.user.uid });

    // 2️⃣ If not found, try by email
    if (!user) {
      console.log("User not found by firebaseuid, trying by email:", req.user.email);
      user = await User.findOne({ email: req.user.email });
    }

    // 3️⃣ If user deleted or not found
    if (!user) {
      console.warn(`⚠️ User not found in DB for update: ${req.user.email}`);
      return res.status(404).json({ message: "User Deleted" });
    }

    // 4️⃣ Apply updates and save
    Object.assign(user, updates);
    await user.save();

    // 5️⃣ Fetch subscription info
    const subscription = await Subscriber.findOne({ email: user.email });

    const responseData = {
      ...user.toObject(),
      subscription: subscription
        ? {
            paid: subscription.paid,
            plan: subscription.plan,
            validTill: subscription.validTill,
            referenceId: subscription.referenceId,
          }
        : null,
    };

    res.json(responseData);
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
