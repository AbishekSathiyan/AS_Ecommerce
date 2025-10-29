import express from "express";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../../config/cloudinary.js";
import Product from "../../models/Product.js";

const router = express.Router();

// Multer Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage });

// ✅ PUT /api/products/update/:id
// ✅ PUT /api/products/update/:id
router.put("/:id", upload.array("images"), async (req, res) => {

  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let { name, price, stock, description, mainCategory, subCategory, existingImages } = req.body;

    // Parse existingImages
    if (existingImages) {
      try {
        existingImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
      } catch (err) {
        console.error("Error parsing existingImages:", err);
        existingImages = product.images || [];
      }
    } else {
      existingImages = product.images || [];
    }

    // ✅ Add new images
    const uploadedImages = req.files?.map((f) => f.path) || [];
    product.images = [...existingImages, ...uploadedImages];

    // ✅ Update fields
    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock); // ✅ update stock
    if (description) product.description = description;
    if (mainCategory) product.mainCategory = mainCategory;
    if (subCategory) product.subCategory = subCategory;

    const updatedProduct = await product.save();

    return res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});



export default router;
