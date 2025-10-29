// routes/Products/FetchAll.js
import express from "express";
import Product from "../../models/Product.js";

const router = express.Router();

// GET /api/products/
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
