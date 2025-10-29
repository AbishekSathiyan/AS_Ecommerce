import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// Firebase Admin (Initialize once)
import { FirebaseConnection } from "./firebaseAdmin.js";

// Routes
import productRoutes from "./routes/Products/ProductRoute.js";
import signupRoute from "./routes/Auth/Signup.js";
import loginRoute from "./routes/Auth/Login.js";
import profileRoutes from "./routes/Auth/Profile.js";
import paymentRoutes from "./routes/Auth/Payment.js";
import orderRoutes from "./routes/Auth/MyOrders.js";
import adminOrderRoutes from "./routes/Products/Orders.js";
import searchRoute from "./routes/Products/Search.js";
import contactRoutes from "./routes/contact.js";
import adminRoute from "./routes/Auth/adminroutes.js";
import userRoutes from "./routes/Auth/users.routes.js";
import subscribeRoute from "./routes/Auth/subscribe.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myapp";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- MIDDLEWARE --------------------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// -------------------- ROUTES --------------------

// Products
app.use("/api/products/search", searchRoute);
app.use("/api/products", productRoutes);

// Auth
app.use("/api/auth/signup", signupRoute);
app.use("/api/auth/login", loginRoute);
app.use("/api/auth/profile", profileRoutes);

// Payment & Subscription
app.use("/api/payment", paymentRoutes);
app.use("/api/subscribe", subscribeRoute);
console.log("✅ Subscribe route loaded");

// Orders
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// Contact
app.use("/api/contact", contactRoutes);

// Admin & User Management
app.use("/api/admin", adminRoute);
app.use("/api/admin/users", userRoutes);

// -------------------- TEST ROUTES --------------------
app.get("/", (req, res) => res.send(`🚀 Server running on localhost:${PORT}`));
app.get("/api", (req, res) => res.send(`🚀 API running on localhost`));

// -------------------- DATABASE & FIREBASE INIT --------------------
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    await FirebaseConnection(); // Initialize Firebase Admin only once
    console.log("🔥 Firebase Admin Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Initialization Error:", err.message);
    process.exit(1);
  }
};

startServer();
