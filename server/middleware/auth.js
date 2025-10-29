import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase service account
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();

// Load hashed admin email from .env
const ADMIN_EMAIL_HASH = process.env.ADMIN_EMAILS?.trim() || "";
console.log(
  "✅ Admin hash loaded:",
  ADMIN_EMAIL_HASH ? "Exists ✅" : "❌ Missing"
);

/**
 * Middleware: Verify Firebase token (any logged-in user)
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || "",
    };

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

/**
 * Middleware: Verify Admin user using hashed email
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    if (!decoded.email) {
      console.log("❌ No email found in token.");
      return res.status(403).json({ message: "Forbidden: No email found" });
    }

    // Hash the email and compare with stored hash
    const emailLower = decoded.email.toLowerCase().trim();
    const emailHash = crypto.createHash("sha256").update(emailLower).digest("hex");

    console.log("🔹 Decoded email:", decoded.email);
    console.log("🔹 Hashed email:", emailHash);
    console.log("🔹 Admin hash from .env:", ADMIN_EMAIL_HASH);

    if (emailHash !== ADMIN_EMAIL_HASH) {
      console.log(`❌ Unauthorized Admin Attempt: ${decoded.email}`);
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // ✅ Mark user as admin
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || "",
      isAdmin: true,
    };

    console.log("✅ Admin verified:", decoded.email);
    next();
  } catch (err) {
    console.error("❌ Admin verification error:", err.message);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
