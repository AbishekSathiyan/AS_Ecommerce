import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../Context/AuthContext";

function OrderPayment({ amount, orderId, rzpOrderId, cartItems, shippingAddress, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handleOrderPayment = async () => {
    if (!user) {
      Swal.fire("Warning", "Please log in to proceed with payment", "warning");
      return;
    }

    if (!rzpOrderId) {
      Swal.fire("Error", "Payment order not found. Please try again.", "error");
      return;
    }

    setLoading(true);

    try {
      const token = await user.getIdToken();
      
      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        order_id: rzpOrderId,
        name: "AS E-Store",
        description: `Order #${orderId}`,
        prefill: {
          email: user.email || "",
          name: shippingAddress.fullName || "",
          contact: shippingAddress.phone || ""
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE}/payment/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                cartItems,
                shippingAddress,
                amount,
                orderId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              Swal.fire({
                title: "Success!",
                text: "Payment completed successfully!",
                icon: "success",
                confirmButtonColor: "#10B981",
              });
              onPaymentSuccess?.();
            } else {
              throw new Error(verifyRes.data.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            Swal.fire({
              title: "Verification Failed",
              text: err.response?.data?.message || err.message || "Payment verification failed",
              icon: "error",
              confirmButtonColor: "#EF4444",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            Swal.fire({
              title: "Payment Cancelled",
              text: "You have cancelled the payment process.",
              icon: "info",
              confirmButtonColor: "#6B7280",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay payment error:", err);
      Swal.fire({
        title: "Payment Failed",
        text: err.response?.data?.message || err.message || "Failed to initiate payment",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Complete Your Payment
        </h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-bold text-indigo-600">₹{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{cartItems.length} items</span>
          </div>
        </div>

        <button
          onClick={handleOrderPayment}
          disabled={loading || !rzpOrderId}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
            loading || !rzpOrderId
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 shadow-lg"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : !rzpOrderId ? (
            "Initializing Payment..."
          ) : (
            `Pay ₹${amount.toLocaleString()}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
}

export default OrderPayment;