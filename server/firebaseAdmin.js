import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// __dirname fix for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account JSON
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();

export const FirebaseConnection = async () => {
  try {
    const user = await adminAuth.listUsers(1);
    console.log(
      "✅ Firebase Admin Connected, sample user:",
      user.users[0]?.uid || "none"
    );
  } catch (err) {
    console.error("❌ Firebase connection failed:", err.message);
  }
};
