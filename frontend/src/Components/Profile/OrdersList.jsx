import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiRefreshCcw,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTruck,
  FiCreditCard,
  FiDollarSign,
  FiClock,
  FiBox,
  FiHome,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiShoppingBag,
  FiShoppingCart,
} from "react-icons/fi";

function OrderList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Order status configuration
  const orderStatuses = [
    {
      key: "pending",
      label: "Order Placed",
      icon: FiClock,
      description: "Your order has been received",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: FiCheckCircle,
      description: "Order confirmed and being processed",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: FiTruck,
      description: "Your order is on the way",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: FiHome,
      description: "Order delivered successfully",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Orders", icon: FiShoppingBag },
    { value: "pending", label: "Pending", icon: FiClock },
    { value: "confirmed", label: "Confirmed", icon: FiCheckCircle },
    { value: "shipped", label: "Shipped", icon: FiTruck },
    { value: "delivered", label: "Delivered", icon: FiHome },
  ];

  // FIXED: Proper status mapping function
  const mapBackendStatusToUI = (order) => {
    // Debug the original order data
    console.log('🔄 Mapping status for order:', {
      _id: order._id,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      isDelivered: order.isDelivered,
      isPaid: order.isPaid
    });

    // Priority mapping based on your actual database structure
    if (order.status) {
      const status = order.status.toLowerCase();
      console.log(`📋 Using order.status: ${status}`);
      return status;
    }
    
    if (order.deliveryStatus) {
      const status = order.deliveryStatus.toLowerCase();
      console.log(`📋 Using order.deliveryStatus: ${status}`);
      return status;
    }
    
    if (order.isDelivered) {
      console.log('📋 Using isDelivered: delivered');
      return "delivered";
    }
    
    if (order.isPaid) {
      console.log('📋 Using isPaid: confirmed');
      return "confirmed";
    }

    console.log('📋 Using default: pending');
    return "pending";
  };

  const fetchOrders = useCallback(
    async (isRefresh = false) => {
      if (!user) return;

      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        setError("");

        const token = await user.getIdToken(true);
        const res = await axios.get(`${API_BASE}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📦 Raw API Response:", res.data);

        // Handle both array response and nested orders property
        const rawOrders = res.data.orders || res.data || [];
        console.log("📦 Raw orders data:", rawOrders);

        // Normalize order data to handle different response structures
        const normalizedOrders = rawOrders.map((order) => {
          console.log("🔍 Processing order:", order._id, order);
          
          // Determine the correct order items array
          const orderItems = order.orderItems || order.items || [];
          console.log("📦 Order items found:", orderItems);

          // Normalize each order item
          const normalizedItems = orderItems.map((item, index) => {
            return {
              ...item,
              // Handle different field names for quantity
              quantity: item.quantity || item.qty || 1,
              // Ensure all required fields exist with fallbacks
              name: item.name || "Unknown Product",
              price: item.price || item.unitPrice || 0,
              image: item.image || item.imageUrl || null,
              size: item.size || null,
              color: item.color || null,
              // Preserve original ID
              _id: item._id || `item-${index}`
            };
          });

          // FIXED: Use the proper status mapping function
          const deliveryStatus = mapBackendStatusToUI(order);
          
          console.log(`✅ Final status for order ${order._id}:`, {
            originalStatus: order.status,
            mappedStatus: deliveryStatus,
            isDelivered: order.isDelivered,
            isPaid: order.isPaid
          });

          // Determine total amount with proper fallbacks
          const totalAmount = order.totalPrice || order.totalAmount || 0;

          // Determine order ID for display
          const displayOrderId = order.razorpay_order_id || 
                               order.orderNumber || 
                               order._id;

          return {
            ...order,
            // Ensure all required fields with proper fallbacks
            _id: order._id,
            deliveryStatus, // This is the normalized status for UI
            originalStatus: order.status, // Keep original for reference
            totalAmount,
            razorpay_order_id: displayOrderId,
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || order.createdAt,
            orderItems: normalizedItems,
            // Shipping address with fallbacks
            shippingAddress: order.shippingAddress || {},
            // Payment info with fallbacks
            paymentMethod: order.paymentMethod || "Unknown",
            paymentStatus: order.paymentStatus || (order.isPaid ? "Paid" : "Pending"),
            isPaid: order.isPaid || false,
            paidAt: order.paidAt,
            itemsPrice: order.itemsPrice || order.totalPrice || 0,
            shippingPrice: order.shippingPrice || 0,
            isDelivered: order.isDelivered || false,
            deliveredAt: order.deliveredAt
          };
        });

        console.log("✅ Final normalized orders:", normalizedOrders);
        setOrders(normalizedOrders);
        setLastUpdated(new Date());

        if (isRefresh) {
          Swal.fire({
            icon: "success",
            title: "Orders Updated",
            text: "Your orders have been refreshed",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            background: "#f0fdf4",
            color: "#166534",
          });
        }
      } catch (err) {
        console.error("❌ Fetch orders error:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Failed to fetch orders. Please try again.";
        setError(errorMessage);

        if (!isRefresh) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
            confirmButtonColor: "#4f46e5",
            background: "#fef2f2",
            color: "#dc2626",
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, API_BASE]
  );

  const handleRefresh = () => fetchOrders(true);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 30 seconds when tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOrders(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getStatusIndex = (status) => {
    const statusMap = {
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const config = orderStatuses.find((step) => step.key === normalizedStatus) || orderStatuses[0];
    console.log(`🎯 Status config for ${status}:`, config);
    return config;
  };

  const getStatusCount = (status) => {
    return orders.filter((order) =>
      status === "all" ? true : order.deliveryStatus?.toLowerCase() === status
    ).length;
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.razorpay_order_id
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.deliveryStatus?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        order.deliveryStatus?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortConfig.key === "totalAmount") {
        return sortConfig.direction === "asc"
          ? (a.totalAmount || 0) - (b.totalAmount || 0)
          : (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      if (sortConfig.key === "status") {
        const statusA = a.deliveryStatus || "pending";
        const statusB = b.deliveryStatus || "pending";
        return sortConfig.direction === "asc"
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
      }
      return 0;
    });

  // Order Status Progress Component
  const OrderStatusProgress = ({ order }) => {
    const currentStatusIndex = getStatusIndex(order.deliveryStatus);
    const statusConfig = getStatusConfig(order.deliveryStatus);

    console.log(`📊 Progress for order ${order._id}:`, {
      deliveryStatus: order.deliveryStatus,
      originalStatus: order.originalStatus,
      currentStatusIndex,
      statusConfig: statusConfig.label
    });

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between relative">
          {orderStatuses.map((status, index) => {
            const StatusIcon = status.icon;
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div
                key={status.key}
                className="flex flex-col items-center relative z-10 flex-1"
              >
                {/* Status Circle */}
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? isCurrent
                        ? `border-blue-500 bg-blue-50 text-blue-600`
                        : `border-green-500 bg-green-50 text-green-600`
                      : "border-gray-300 bg-gray-50 text-gray-400"
                  }`}
                >
                  <StatusIcon className="w-4 h-4" />
                </div>

                {/* Status Label */}
                <span
                  className={`text-xs font-medium mt-2 text-center ${
                    isCompleted
                      ? isCurrent
                        ? "text-blue-600"
                        : "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {status.label}
                </span>

                {/* Status Description */}
                <span className="text-xs text-gray-500 mt-1 text-center max-w-20">
                  {status.description}
                </span>

                {/* Connecting Line */}
                {index < orderStatuses.length - 1 && (
                  <div
                    className={`absolute top-5 left-10 w-full h-0.5 -z-10 transition-all duration-500 ${
                      index < currentStatusIndex
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                    style={{ width: "calc(100% - 2.5rem)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Status Message */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Current Status:{" "}
            <span className={`font-semibold ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </p>
          {order.deliveryStatus === "delivered" && order.deliveredAt && (
            <p className="text-xs text-gray-500 mt-1">
              Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
            </p>
          )}
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-1">
              Database Status: {order.originalStatus || 'N/A'} → Display: {statusConfig.label}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Stats Overview Component
  const StatsOverview = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statusOptions.map((status) => {
          const StatusIcon = status.icon;
          const count = getStatusCount(status.value);
          const isActive = statusFilter === status.value;
          const statusConfig = getStatusConfig(status.value);

          return (
            <div
              key={status.value}
              className={`bg-white rounded-lg border ${
                statusConfig?.borderColor || "border-gray-200"
              } p-4 cursor-pointer transition-all duration-200 ${
                isActive
                  ? "ring-2 ring-blue-500 ring-opacity-50 shadow-sm"
                  : "hover:shadow-sm"
              }`}
              onClick={() => setStatusFilter(status.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {status.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {count}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg ${
                    statusConfig?.bgColor || "bg-gray-100"
                  }`}
                >
                  <StatusIcon
                    className={`w-4 h-4 ${
                      statusConfig?.textColor || "text-gray-600"
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="animate-spin h-16 w-16 border-4 border-indigo-300 border-t-indigo-600 rounded-full"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );

  if (error && !orders.length)
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <FiAlertCircle className="text-red-500 w-12 h-12 mb-4" />
        <p className="text-gray-700 font-semibold mb-2">Something went wrong</p>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );

  if (!orders.length)
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <FiPackage className="text-indigo-500 w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold">No orders yet</h3>
        <p className="text-gray-500 mb-4">
          Start shopping and your orders will appear here.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Shop Now
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">
            Track and manage all your orders in one place
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            <FiRefreshCcw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Search and Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by ID, name, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200 min-w-40"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredAndSortedOrders.map((order) => {
          const statusConfig = getStatusConfig(order.deliveryStatus);
          const totalItems =
            order.orderItems?.reduce(
              (total, item) => total + (item.quantity || 1),
              0
            ) || 0;
          
          const orderItemsCount = order.orderItems?.length || 0;

          console.log("🎨 Rendering order:", order._id, {
            deliveryStatus: order.deliveryStatus,
            originalStatus: order.originalStatus,
            statusConfig: statusConfig.label
          });

          return (
            <div
              key={order._id}
              className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order #
                      <span className="text-indigo-600 ml-1">
                        {order.razorpay_order_id?.slice(-8) ||
                          order._id?.slice(-8)}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}
                    >
                      <statusConfig.icon className="w-3 h-3 mr-1" />
                      {statusConfig.label.toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status Progress */}
              <div className="px-6 pt-6">
                <OrderStatusProgress order={order} />
              </div>

              {/* Order Items */}
              <div className="px-6 pb-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FiPackage className="w-4 h-4" />
                    Order Items ({orderItemsCount})
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiShoppingCart className="w-4 h-4" />
                    <span>Total Items: {totalItems}</span>
                  </div>
                </div>
                
                {orderItemsCount > 0 ? (
                  <div className="space-y-3">
                    {order.orderItems.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.name || "Unnamed Product"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Price:</span>
                                <span>₹{item.price || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Quantity:</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-semibold">
                                  {item.quantity || 1}
                                </span>
                              </div>
                              {item.size && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Size:</span>
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                    {item.size}
                                  </span>
                                </div>
                              )}
                              {item.color && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Color:</span>
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                                    {item.color}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity || 1} × ₹{item.price || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No items found in this order</p>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="px-6 py-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Shipping Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      Shipping Address
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-900">
                        {order.shippingAddress?.fullName || "N/A"}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {order.shippingAddress?.address || "No address provided"}
                      </p>
                      <p className="text-gray-600">
                        {order.shippingAddress?.city && (
                          <>
                            {order.shippingAddress.city}
                            {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                            {order.shippingAddress.zipCode && ` - ${order.shippingAddress.zipCode}`}
                          </>
                        )}
                      </p>
                      {order.shippingAddress?.phone && (
                        <div className="flex items-center gap-1 text-gray-600 mt-2">
                          <FiPhone className="w-3 h-3" />
                          <span className="text-sm">
                            {order.shippingAddress.phone}
                          </span>
                        </div>
                      )}
                      {order.shippingAddress?.email && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <FiMail className="w-3 h-3" />
                          <span className="text-sm">
                            {order.shippingAddress.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4" />
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">
                          {order.paymentMethod || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-medium ${
                            order.paymentStatus === "Paid" || order.isPaid
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.paymentStatus ||
                            (order.isPaid ? "Paid" : "Pending")}
                        </span>
                      </div>
                      {order.razorpay_order_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order ID:</span>
                          <span className="text-sm text-gray-600 font-mono">
                            {order.razorpay_order_id}
                          </span>
                        </div>
                      )}
                      {order.paidAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid on:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(order.paidAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-end">
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between gap-8">
                        <span className="text-gray-600">Items Total:</span>
                        <span className="font-medium">
                          ₹{(order.itemsPrice || order.totalAmount)?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">
                          ₹{(order.shippingPrice || 0)?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between gap-8 border-t pt-2">
                        <span className="text-lg font-semibold text-gray-900">
                          Total Amount:
                        </span>
                        <span className="text-lg font-bold text-indigo-600">
                          ₹{order.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredAndSortedOrders.length === 0 &&
        (searchTerm || statusFilter !== "all") && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
    </div>  
  );
}

export default OrderList;