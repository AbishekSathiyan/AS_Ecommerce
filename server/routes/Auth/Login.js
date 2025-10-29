import express from "express";
import { adminAuth } from "../../firebaseAdmin.js";
import User from "../../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) return res.status(400).json({ message: "ID Token is required" });

  try {
    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Find user in MongoDB
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
