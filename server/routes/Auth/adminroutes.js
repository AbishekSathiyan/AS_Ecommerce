// backend/routes/Auth/adminroutes.js
import express from "express";
import { verifyAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Protected route to check admin status
router.get("/verify", verifyAdmin, (req, res) => {
  return res.json({ isAdmin: true });
});

export default router;
