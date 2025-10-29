import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },

    description: String,
    mainCategory: { type: String, required: true },
    subCategory: { type: String, required: true },
    images: [String], // file paths like /uploads/xyz.jpg
    imageLinks: [String], // external image URLs
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
