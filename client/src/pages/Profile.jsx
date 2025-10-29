// Pages/Profile.jsx
import UserProfile from "../Components/Profile/UserProfile";

export default function ProfilePage() {
  return <UserProfile />;
}




/*import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiMapPin,
  FiMap,
  FiEdit,
  FiSave,
  FiX,
  FiShield,
  FiCheckCircle,
  FiShoppingBag,
  FiPackage,
  FiClock,
  FiDollarSign,
  FiTruck,
} from "react-icons/fi";

function UserProfile() {
  const { user, loading: authLoading, logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "orders"
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const showPopup = (type, title, text) => {
    Swal.fire({
      title,
      text,
      icon: type,
      background: "#fafafa",
      width: "90%",
      padding: "2em",
      confirmButtonColor: type === "success" ? "#4f46e5" : "#dc2626",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-gray-200",
        title: "text-2xl font-bold text-gray-800",
        content: "text-gray-700 text-md",
      },
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
        if (res.data.updatedAt) setLastUpdated(new Date(res.data.updatedAt));
      } catch (err) {
        console.error(err);
        showPopup("error", "Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      showPopup("error", "Error", "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return showPopup("error", "Error", "Please login first");
    try {
      const token = await user.getIdToken();
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData(res.data);
      setIsEditing(false);
      setLastUpdated(new Date());
      showPopup("success", "Profile Updated", "Your profile has been updated successfully!");
    } catch (err) {
      console.error(err);
      showPopup("error", "Update Failed", "Failed to update profile!");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showPopup("success", "Logged Out", "You have been logged out successfully!");
    } catch (err) {
      showPopup("error", "Logout Failed", "Could not log out. Try again!");
    }
  };

  const getInitials = () => {
    if (formData.firstName && formData.lastName)
      return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    return user?.email ? user.email.charAt(0).toUpperCase() : "U";
  };

  const avatarColor = (() => {
    if (!user) return "from-indigo-600 to-violet-600";
    const colors = [
      "from-indigo-600 to-violet-600",
      "from-emerald-600 to-teal-600",
      "from-rose-600 to-pink-600",
      "from-amber-600 to-orange-600",
    ];
    return colors[user.email.length % colors.length];
  })();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "shipped":
      case "delivered":
        return <FiTruck className="w-3 h-3 mr-1" />;
      default:
        return <FiClock className="w-3 h-3 mr-1" />;
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading your profile...</p>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-md p-8 bg-white rounded-3xl shadow-lg text-center border border-slate-100">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <FiUser className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h3>
          <p className="text-slate-600 mb-6">Please log in to view your profile.</p>
          <Link to="/login">
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
              Login Now
            </button>
          </Link>
        </div>
      </div>
    );

  const fieldConfig = [
    { id: "firstName", label: "First Name", icon: <FiUser className="w-5 h-5 text-indigo-600" /> },
    { id: "lastName", label: "Last Name", icon: <FiUser className="w-5 h-5 text-indigo-600" /> },
    { id: "email", label: "Email", icon: <FiMail className="w-5 h-5 text-indigo-600" />, disabled: true },
    { id: "phone", label: "Phone", icon: <FiPhone className="w-5 h-5 text-indigo-600" /> },
    { id: "address", label: "Address", icon: <FiHome className="w-5 h-5 text-indigo-600" /> },
    { id: "city", label: "City", icon: <FiMapPin className="w-5 h-5 text-indigo-600" /> },
    { id: "zipCode", label: "ZIP Code", icon: <FiMap className="w-5 h-5 text-indigo-600" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header 
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className={`w-28 h-28 ${avatarColor} rounded-full flex items-center justify-center shadow-md text-white text-3xl font-bold`}>
              {getInitials()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <FiCheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">AS Ecommerce</h1>
          <h2 className="text-2xl font-semibold text-indigo-700 mb-2">Your Account</h2>
          <p className="text-slate-600 flex items-center justify-center">
            <FiShield className="mr-1 w-4 h-4 text-indigo-600" /> Your information is securely stored
          </p>
        </div>

        {/* Navigation Tabs 
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-2 border border-slate-100">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
              >
                <FiUser className="w-4 h-4 mr-2" /> Profile
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
              >
                <FiShoppingBag className="w-4 h-4 mr-2" /> My Orders
              </button>
            </div>
          </div>
        </div>

        {/* Profile Tab Content 
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 mb-6 border border-slate-100">
            <div className="p-1 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-2 rounded-lg shadow-sm">
                    <FiUser className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="ml-3 text-xl sm:text-2xl font-bold text-slate-800">Personal Information</h2>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] justify-center"
                    >
                      <FiEdit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Edit Profile
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-red-500 text-white rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all justify-center"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Logout
                  </button>
                </div>
              </div>

              {/* Last Updated Info 
              <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 flex items-center">
                  <FiClock className="w-4 h-4 mr-2 text-indigo-600" /> Last updated: {formatDate(lastUpdated)}
                </p>
              </div>

              {/* Display / Edit Mode =
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {fieldConfig.map(({ id, label, icon }) => (
                    <div
                      key={id}
                      className="bg-slate-50 p-4 sm:p-5 rounded-xl transition-all duration-300 hover:bg-indigo-50/50 hover:shadow-sm group border border-slate-100"
                    >
                      <div className="text-xs sm:text-sm text-slate-600 flex items-center mb-1">
                        <span className="mr-2">{icon}</span> {label}
                      </div>
                      <div className="text-slate-800 font-medium text-md sm:text-lg break-words">
                        {formData[id] || (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {fieldConfig.map(({ id, label, icon, disabled }) => (
                      <div key={id} className="relative">
                        <div className="text-xs sm:text-sm text-slate-700 flex items-center mb-2">
                          <span className="mr-2">{icon}</span> {label}
                          {disabled && (
                            <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              Cannot be changed
                            </span>
                          )}
                        </div>
                        <input
                          type={id === "email" ? "email" : "text"}
                          name={id}
                          value={formData[id] || ""}
                          onChange={handleChange}
                          disabled={disabled}
                          className={`w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all duration-300 shadow-sm ${
                            disabled ? "bg-slate-100 cursor-not-allowed opacity-80" : "hover:border-indigo-300"
                          }`}
                          placeholder={`Enter your ${label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex items-center justify-center flex-1 px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                    >
                      <FiSave className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-400 text-white rounded-xl shadow-sm hover:bg-slate-500 hover:scale-[1.02] transition-all duration-300"
                    >
                      <FiX className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab Content 
        {activeTab === "orders" && (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-slate-600 italic">You have no orders yet.</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Order #
                        {order.orderNumber
                          ? order.orderNumber.toUpperCase()
                          : order._id?.slice(-8).toUpperCase() || "N/A"}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center">
                        <FiClock className="w-3 h-3 mr-1" />
                        {formatDate(order.createdAt || new Date())}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )} flex items-center`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status || "Pending"}
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center">
                        <FiDollarSign className="w-4 h-4 mr-1" />
                        {order.totalAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                    <div className="lg:col-span-2">
                      <span className="text-slate-600 font-medium">Items:</span>
                      <div className="mt-2 space-y-2">
                        {order.items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                          >
                            <img
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md border border-slate-200"
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml;base64,..."; // fallback
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-slate-800 font-medium">{item.name || "Unnamed Product"}</p>
                              <p className="text-slate-500 text-xs">
                                Qty: {item.quantity || 1} | ₹{item.price?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <div className="text-slate-700 font-medium">
                              ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="text-slate-600 font-medium">Shipping Details:</span>
                      <div className="mt-2 text-slate-800 space-y-1">
                        {order.shippingAddress ? (
                          <>
                            <p className="font-medium">{users.firstname}</p>
                            <p className="text-sm">{users.address}</p>
                            <p className="text-sm">
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p className="text-sm">{order.shippingAddress.country}</p>
                            <p className="text-sm font-medium mt-2">📞 {order.shippingAddress.phone || "N/A"}</p>
                          </>
                        ) : (
                          <p className="text-slate-500 italic">No shipping address provided</p>
                        )}
                        {/* Razorpay Order ID 
                        <p className="text-xs mt-2 text-indigo-700 font-medium">
                          Razorpay Order ID: {order.orderNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
*/
