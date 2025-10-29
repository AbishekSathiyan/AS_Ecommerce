import express from "express";
import { adminAuth } from "../../firebaseAdmin.js";
import User from "../../models/User.js";
import Subscriber from "../../models/Subscriber.js";

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Save Firebase user + profile info to MongoDB
 */
router.post("/", async (req, res) => {
  try {
    const {
      uid, // Firebase UID
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      zipCode,
      subscribe, // newsletter opt-in
    } = req.body;

    console.log("Received signup data:", req.body);

    // Validate required fields
    if (!uid || !email) {
      return res.status(400).json({ message: "UID and email are required" });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    // Verify UID with Firebase Admin
    try {
      await adminAuth.getUser(uid);
    } catch (error) {
      console.error("Firebase Admin auth error:", error);
      return res.status(400).json({ message: "Invalid Firebase UID" });
    }

    // Check if user already exists (by uid or email)
    const existingUserByUid = await User.findOne({ firebaseuid: uid });
    const existingUserByEmail = await User.findOne({ email });
    
    if (existingUserByUid || existingUserByEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user - FIXED: Use firebaseuid field from User model
    const newUser = new User({
      firebaseuid: uid, // Map to the correct field name in User model
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : undefined,
      address: address ? address.trim() : undefined,
      city: city ? city.trim() : undefined,
      zipCode: zipCode ? zipCode.trim() : undefined,
    });

    await newUser.save();

    // If subscribe is true, save email in Subscriber collection
    if (subscribe) {
      try {
        const existingSubscriber = await Subscriber.findOne({ email });
        if (!existingSubscriber) {
          await Subscriber.create({ 
            email: email.trim(),
            source: "signup"
          });
          console.log("Subscriber added for email:", email);
        }
      } catch (subscriberError) {
        console.error("Error adding subscriber:", subscriberError);
        // Don't fail the signup if subscriber creation fails
      }
    }

    console.log("User created successfully:", newUser._id);

    return res.status(201).json({ 
      message: "User created successfully", 
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    return res.status(500).json({ message: "Server error during signup" });
  }
});

export default router;