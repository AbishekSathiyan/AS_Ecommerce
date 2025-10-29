import express from "express";
import Product from "../../models/Product.js";
import fs from "fs";

const router = express.Router();

// DELETE /delete/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/))
    return res.status(400).json({ message: "Invalid product ID" });

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete uploaded files
    product.images.forEach(img => {
      const fullPath = img.replace("/uploads/", "uploads/");
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

export default router;
