import Product from "../models/Product.js";

// Use environment variable for API base URL
const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const addProduct = async (req, res) => {
  try {
    const { name, price, description: detailedDescription, category } = req.body;

    // Handle uploaded files
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `${API_BASE_URL.replace("/api", "")}/uploads/${file.filename}`);
    }

    // Build full description string
    let fullDescription = `Product Name: ${name}\n\nPrice: ₹${price}\n\n`;

    if (images.length > 0) {
      const imageLinks = images
        .map((img, idx) => `Image URL ${idx + 1}: ${img}`)
        .join("\n");
      fullDescription += `${imageLinks}\n\n`;
    } else {
      fullDescription += `Image URL: https://via.placeholder.com/200\n\n`; // fallback placeholder
    }

    fullDescription += `Description:\n${detailedDescription || "No detailed description provided."}`;

    const product = new Product({
      name,
      price,
      description: fullDescription,
      category,
      images, // keep images array for frontend
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
