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

// ✅ POST /api/products/add
router.post("/", upload.array("images"), async (req, res) => {
  try {
    const {
      name,
      price,
      stock,
      description,
      mainCategory,
      subCategory,
      imageLinks,
    } = req.body;

    if (!name || !price || !mainCategory || !subCategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Cloudinary URLs
    const uploadedImages = req.files?.map((f) => f.path) || [];

    // Parse JSON image links from frontend
    let extraImages = [];
    if (imageLinks) {
      try {
        extraImages = JSON.parse(imageLinks);
      } catch (err) {
        return res.status(400).json({ message: "Invalid imageLinks format" });
      }
    }

    const allImages = [...uploadedImages, ...extraImages];
    if (allImages.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      stock: stock !== undefined && stock !== "" ? parseInt(stock) : 0,
      description: description || "",
      mainCategory,
      subCategory,
      images: allImages,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
