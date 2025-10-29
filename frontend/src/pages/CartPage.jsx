import React, { useState, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import OrderPayment from "../Components/OrderPayment";
import { ShippingAddressForm } from "../Components/ShippingAddressForm";
import axios from "axios";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function CartPage() {
  const {
    cartItems,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return setProfileLoading(false);
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = res.data;
        setShippingAddress({
          fullName: `${profile.firstName || ""} ${
            profile.lastName || ""
          }`.trim(),
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "TamilNadu",
          zipCode: profile.zipCode || "",
          phone: profile.phone || "",
          email: user.email || "",
        });
      } catch {
        setShippingAddress({
          fullName: user.displayName || "",
          address: "",
          city: "",
          state: "TamilNadu",
          zipCode: "",
          phone: user.phoneNumber || "",
          email: user.email || "",
        });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Select all items by default
  useEffect(() => {
    setSelectedItems(cartItems.map((item) => item._id));
  }, [cartItems]);

  const toggleSelectItem = (id) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item._id));
    }
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item._id)
  );
  const totalAmount = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = selectedCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Handle COD order placement
  const handleCODOrder = async () => {
    if (!user || !shippingAddress || selectedCartItems.length === 0) {
      Swal.fire("Error", "Please complete all required fields", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await user.getIdToken();

      console.log("Creating COD order with data:", {
        cartItems: selectedCartItems,
        amount: totalAmount,
        shippingAddress,
        paymentMethod: "COD",
      });

      const res = await axios.post(
        `${API_BASE}/payment/create`,
        {
          cartItems: selectedCartItems,
          amount: totalAmount,
          shippingAddress,
          paymentMethod: "COD",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("COD Order response:", res.data);

      if (res.data.success) {
        if (res.data.orderId) {
          await Swal.fire({
            title: "Order Placed Successfully!",
            text: "Your Cash on Delivery order has been confirmed.",
            icon: "success",
            confirmButtonColor: "#10B981",
            showClass: {
              popup: "animate__animated animate__fadeInDown animate__faster",
            },
          });

          // Remove only the selected items from cart
          selectedItems.forEach((itemId) => {
            removeFromCart(itemId);
          });

          navigate("/profile");
        } else {
          console.error("Backend returned Razorpay order for COD:", res.data);
          throw new Error(
            "Payment system error. Please try again or contact support."
          );
        }
      } else {
        throw new Error(res.data.message || "Failed to place COD order");
      }
    } catch (err) {
      console.error("COD Order error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to place COD order. Please try again.";

      await Swal.fire({
        title: "Order Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#EF4444",
        showClass: {
          popup: "animate__animated animate__headShake animate__faster",
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle online payment order
  const handleOnlinePayment = async () => {
    if (!user || !shippingAddress || selectedCartItems.length === 0) {
      Swal.fire("Error", "Please complete all required fields", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await user.getIdToken();

      console.log("Creating online order with data:", {
        cartItems: selectedCartItems,
        amount: totalAmount,
        shippingAddress,
        paymentMethod: "online",
      });

      const res = await axios.post(
        `${API_BASE}/payment/create`,
        {
          cartItems: selectedCartItems,
          amount: totalAmount,
          shippingAddress,
          paymentMethod: "online",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Online Order response:", res.data);

      if (res.data.success) {
        setOrderData({
          amount: totalAmount,
          cartItems: selectedCartItems,
          shippingAddress,
          orderId: res.data.orderId,
          rzpOrderId: res.data.rzpOrderId,
        });
        setShowPaymentModal(true);
      } else {
        throw new Error(res.data.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Online Payment order creation error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to initiate payment";

      Swal.fire({
        title: "Payment Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    try {
      await Swal.fire({
        title: "Payment Successful!",
        text: "Your order has been placed successfully.",
        icon: "success",
        confirmButtonColor: "#10B981",
        showClass: {
          popup: "animate__animated animate__bounceIn animate__faster",
        },
      });

      // Remove only the selected items from cart
      selectedItems.forEach((itemId) => {
        removeFromCart(itemId);
      });

      setShowPaymentModal(false);
      navigate("/profile");
    } catch (error) {
      console.error("Payment success handling error:", error);
    }
  };

  // Handle address confirmation
  const handleConfirmAddress = (address) => {
    setShippingAddress(address);
    setShowAddressModal(false);
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to proceed with checkout",
        icon: "warning",
        confirmButtonColor: "#3B82F6",
        showCancelButton: true,
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (selectedItems.length === 0) {
      Swal.fire({
        title: "No Items Selected",
        text: "Please select at least one item to proceed with checkout",
        icon: "warning",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    // Check amount limits for online payments
    if (paymentMethod === "online" && totalAmount > 99999) {
      Swal.fire({
        title: "Amount Limit Exceeded",
        text: "Online payments are limited to ₹99,999. Please use Cash on Delivery for larger orders.",
        icon: "warning",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    if (
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.zipCode
    ) {
      setShowAddressModal(true);
      return;
    }

    if (paymentMethod === "COD") {
      handleCODOrder();
    } else {
      handleOnlinePayment();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3,
      },
    },
  };

  const summaryVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2,
      },
    },
  };

  // Empty cart animation variants
  const emptyCartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const floatingIconVariants = {
    hidden: { x: 0 },
    visible: {
      x: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut", // FIXED: Changed from invalid 'easeOutIn' to valid 'easeInOut'
      },
    },
  };

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
      },
    },
  };

  if (profileLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-spin h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">
        <Header />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={emptyCartVariants}
          className="flex-1 flex items-center justify-center px-4 py-8 relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <motion.div
            variants={sparkleVariants}
            className="absolute top-20 left-10 text-indigo-200"
          >
            <Sparkles size={24} />
          </motion.div>
          <motion.div
            variants={sparkleVariants}
            className="absolute top-40 right-20 text-purple-200"
            style={{ transitionDelay: "0.5s" }}
          >
            <Sparkles size={20} />
          </motion.div>
          <motion.div
            variants={sparkleVariants}
            className="absolute bottom-40 left-20 text-pink-200"
            style={{ transitionDelay: "1s" }}
          >
            <Sparkles size={16} />
          </motion.div>

          <div className="text-center max-w-2xl mx-auto">
            {/* Main icon with floating animation */}
            <motion.div
              variants={floatingIconVariants}
              className="relative mb-6 inline-block"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    delay: 0.2,
                    duration: 0.8,
                  }}
                  className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
                >
                  <ShoppingBag className="h-14 w-14 text-white" />
                </motion.div>

                {/* Pulse effect */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 border-4 border-indigo-400 rounded-3xl"
                />
              </div>
            </motion.div>

            {/* Text content */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            >
              Your cart is empty
            </motion.h2>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-600 mb-6 max-w-md mx-auto leading-relaxed"
            >
              Looks like you haven't added anything to your cart yet. Let's find
              something amazing for you!
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg flex items-center gap-2 group"
              >
                Start Shopping
                <motion.span
                  initial={{ x: -5 }}
                  animate={{ x: 5 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1,
                    ease: "easeInOut", // FIXED: Added valid easing
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Browse Products
              </motion.button>
            </motion.div>

            {/* Additional info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500"
            >
              <motion.div
                whileHover={{ y: -3 }}
                className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20"
              >
                <Truck className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p>Free shipping on orders over ₹499</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20"
              >
                <CheckCircle className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p>Easy returns within 7 days</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20"
              >
                <CreditCard className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                <p>Secure payment options</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">
      <Header />
      <motion.div
        initial="hidden"
        animate="visible"
        className="flex-1 py-6 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <ShoppingBag className="h-7 w-7 text-indigo-600" />
                  Shopping Cart ({cartItems.length} items)
                </h1>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleSelectAll}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  {selectedItems.length === cartItems.length
                    ? "Deselect All"
                    : "Select All"}
                </motion.button>
              </div>
            </motion.div>

            {/* Cart Items List */}
            <motion.div
              variants={containerVariants}
              className="space-y-4 overflow-y-auto max-h-[65vh] pr-2"
            >
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="bg-white rounded-xl shadow-lg p-5 flex gap-5 items-center hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => toggleSelectItem(item._id)}
                        className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </motion.div>

                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={item.images[0]}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-md"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-800 truncate">
                        {item.name}
                      </h3>
                      <p className="text-indigo-600 font-bold text-xl mt-1">
                        ₹{item.price.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                          <motion.button
                            whileHover={{
                              scale: 1.1,
                              backgroundColor: "#e5e7eb",
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => decrementQuantity(item)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 bg-white rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </motion.button>

                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="font-semibold text-gray-800 min-w-6 text-center text-sm"
                          >
                            {item.quantity}
                          </motion.span>

                          <motion.button
                            whileHover={{
                              scale: 1.1,
                              backgroundColor: "#e5e7eb",
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => incrementQuantity(item)}
                            className="p-1.5 bg-white rounded-lg shadow-sm transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </motion.button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05, color: "#dc2626" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item._id)}
                          className="ml-auto p-2 text-gray-400 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                          <Trash2 className="h-4 w-4 group-hover:text-red-600 transition-colors" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              variants={summaryVariants}
              className="bg-white p-6 rounded-xl shadow-xl sticky top-6 space-y-5 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Order Summary
              </h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                <AnimatePresence>
                  {selectedCartItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-800 whitespace-nowrap text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-lg font-semibold text-gray-800">
                  <span>Total ({totalItems} items)</span>
                  <motion.span
                    key={totalAmount}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-indigo-600"
                  >
                    ₹{totalAmount.toLocaleString()}
                  </motion.span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      paymentMethod === "online"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("online")}
                  >
                    <CreditCard className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Online</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      paymentMethod === "COD"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <Truck className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">COD</span>
                  </motion.button>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{
                  scale: selectedItems.length > 0 ? 1.02 : 1,
                  boxShadow:
                    selectedItems.length > 0
                      ? "0 10px 25px -5px rgba(79, 70, 229, 0.4)"
                      : "none",
                }}
                whileTap={{ scale: selectedItems.length > 0 ? 0.98 : 1 }}
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || isProcessing}
                className={`w-full py-3 rounded-lg font-bold text-base transition-all duration-300 ${
                  selectedItems.length === 0 || isProcessing
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : paymentMethod === "online" ? (
                  `Pay ₹${totalAmount.toLocaleString()}`
                ) : (
                  `Place COD Order`
                )}
              </motion.button>

              {/* Trust Indicators */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Truck className="h-3 w-3 text-green-500" />
                  <span>Free shipping on orders over ₹499</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="h-3 w-3 text-blue-500" />
                  <span>Secure SSL encryption payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="h-3 w-3 text-orange-500" />
                  <span>7-day easy returns & exchanges</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Order Payment Modal */}
        {showPaymentModal && orderData && (
          <OrderPayment
            amount={orderData.amount}
            orderId={orderData.orderId}
            rzpOrderId={orderData.rzpOrderId}
            cartItems={orderData.cartItems}
            shippingAddress={orderData.shippingAddress}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Shipping Address Modal */}
        {showAddressModal && (
          <ShippingAddressForm
            initialAddress={shippingAddress}
            onConfirm={handleConfirmAddress}
            onCancel={() => setShowAddressModal(false)}
          />
        )}
      </motion.div>
      <Footer />
    </div>
  );
}

export default CartPage;