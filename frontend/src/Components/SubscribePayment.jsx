import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { loadRazorpay } from "../utils/loadRazorpay";

const SubscribePayment = ({ email, plan = "monthly", onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const amount = plan === "monthly" ? 299 : 2999;

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handleSubscribePayment = async () => {
    if (!email)
      return Swal.fire("Warning", "Please enter your email", "warning");

    setLoading(true);

    try {
      // 1️⃣ Pre-check subscription
      const { data: checkData } = await axios.post(`${API_BASE}/subscribe/`, {
        email,
      });
      if (checkData.subscribed) {
        Swal.fire("Info", "You are already subscribed! 🎉", "info");
        return;
      }

      // 2️⃣ Load Razorpay
      await loadRazorpay();

      // 3️⃣ Create Razorpay order
      // ✅ 3️⃣ Create Razorpay order
      const { data } = await axios.post(`${API_BASE}/subscribe/create-order`, {
        plan,
      });
      if (!data.order) throw new Error("Order creation failed");

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "AS Ecommerce",
        description: "Premium Newsletter Subscription",
        prefill: { email },
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE}/subscribe/verify-payment`,
              {
                email,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              }
            );

            if (verifyRes.data.success) {
              Swal.fire("Success", "Subscription Successful!🎉.", "success");
              onPaymentSuccess?.();
            } else {
              Swal.fire("Error", verifyRes.data.message, "error");
            }
          } catch (err) {
            Swal.fire("Error", err.message, "error");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.open();
    } catch (err) {
      Swal.fire("Error", err.message || "Payment initiation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-2">
      <button
        onClick={handleSubscribePayment}
        disabled={loading}
        className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105"
        }`}
      >
        {loading ? "Processing..." : `Subscribe ₹${amount}`}
      </button>
    </div>
  );
};

export default SubscribePayment;
