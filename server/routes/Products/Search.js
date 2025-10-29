import express from "express";
import Product from "../../models/Product.js";

const router = express.Router();

// GET /api/products/search?q=...
router.get("/", async (req, res) => {
  const { q } = req.query;

  try {
    let products;

    if (!q || q.trim() === "") {
      // No search term, return all products
      products = await Product.find().sort({ createdAt: -1 });
      console.log("No search query provided, returning all products:", products.length);
    } else {
      // Partial, case-insensitive match on product name
      const regex = new RegExp(q.trim(), "i"); // i = case-insensitive
      products = await Product.find({ name: { $regex: regex } }).sort({ createdAt: -1 });
      console.log(`Search query received: "${q}", products found: ${products.length}`);
    }

    res.json(products);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
