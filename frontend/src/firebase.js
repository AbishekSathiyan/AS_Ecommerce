// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config (your frontend keys)
const firebaseConfig = {
  apiKey: "AIzaSyBHzn1zVrM1iJHv1iRuMsRfXYyRE8RTDQ0",
  authDomain: "ecommerce-ab82b.firebaseapp.com",
  projectId: "ecommerce-ab82b",
  storageBucket: "ecommerce-ab82b.appspot.com",
  messagingSenderId: "571861315290",
  appId: "1:571861315290:web:b8bfef465c4a2524fd7fe3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
