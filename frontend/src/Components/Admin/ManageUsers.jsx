import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  FiTrash2,
  FiUser,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLoader,
  FiEye,
  FiXCircle,
  FiUsers,
  FiList,
  FiCalendar,
  FiCreditCard,
  FiX,
} from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // API Base URL
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    "https://bulk-mail-back-jdjev5dai-abisheksathiyans-projects.vercel.app/api";

  // Fetch data based on active tab
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) await fetchData(user);
    });
    return () => unsubscribe();
  }, [activeTab]);

  // Filter search
  useEffect(() => {
    if (searchTerm) {
      const dataToFilter = activeTab === "users" ? users : subscribers;
      const filtered = dataToFilter.filter(
        (item) =>
          (item.firstName &&
            `${item.firstName} ${item.lastName || ""}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.email &&
            item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.phone && item.phone.includes(searchTerm)) ||
          (item.city &&
            item.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.zipCode && item.zipCode.includes(searchTerm))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(activeTab === "users" ? users : subscribers);
    }
  }, [searchTerm, users, subscribers, activeTab]);

  // Fetch data with Authorization
  const fetchData = async (firebaseUser) => {
    try {
      setLoading(true);
      setError("");

      const token = await firebaseUser.getIdToken();

      let endpoint;
      let response;

      if (activeTab === "users") {
        endpoint = "admin/users";
        response = await fetch(`${API_BASE}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        endpoint = "subscribe/admin/subscribers";
        response = await fetch(`${API_BASE}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab}: ${response.statusText}`);
      }

      const data = await response.json();

      if (activeTab === "users") {
        setUsers(data);
        setFilteredData(data);
      } else {
        const subscribersData = data.success ? data.subscribers : data;
        const processedSubscribers = subscribersData.map((sub) => ({
          ...sub,
          createdAt: sub.date || sub.createdAt,
          updatedAt: sub.validTill || sub.updatedAt,
          _id: sub._id || sub.id,
        }));

        setSubscribers(processedSubscribers);
        setFilteredData(processedSubscribers);
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (itemId) => {
    const dataToUse = activeTab === "users" ? users : subscribers;
    const itemToDelete = dataToUse.find((item) => item._id === itemId);
    const itemType = activeTab === "users" ? "user" : "subscriber";

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${
        itemToDelete?.firstName || itemToDelete?.email
      }? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeleteLoading(itemId);
    try {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      const token = firebaseUser && (await firebaseUser.getIdToken());

      let endpoint;
      if (activeTab === "users") {
        endpoint = `admin/users/${itemId}`;
      } else {
        endpoint = `subscribe/${itemId}`;
      }

      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete ${itemType}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || `Failed to delete ${itemType}`);
      }

      if (activeTab === "users") {
        setUsers((prev) => prev.filter((u) => u._id !== itemId));
        setFilteredData((prev) => prev.filter((u) => u._id !== itemId));
      } else {
        setSubscribers((prev) => prev.filter((s) => s._id !== itemId));
        setFilteredData((prev) => prev.filter((s) => s._id !== itemId));
      }
    } catch (err) {
      console.error(`Error deleting ${itemType}:`, err);
      alert(`Failed to delete ${itemType}. ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // View user/subscriber details
  const handleViewItem = (item) => {
    setSelectedUser(item);
    setIsUserModalOpen(true);
  };

  // Manual refresh
  const handleRefresh = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) fetchData(user);
  };

  // Clear search when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  // Safe date formatting function
  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Safe date and time formatting function
  const formatDateTime = (dateInput) => {
    if (!dateInput) return "N/A";
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Option 1: Modern Card Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-6 lg:mb-0">
              <div className="h-8 bg-gray-300 rounded-xl w-64 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-300 rounded-xl w-32 animate-pulse"></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="bg-white rounded-2xl p-1 mb-8">
            <div className="flex space-x-1">
              <div className="flex-1 h-14 bg-gray-300 rounded-xl animate-pulse"></div>
              <div className="flex-1 h-14 bg-gray-300 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Search Skeleton */}
          <div className="bg-white rounded-2xl p-6 mb-8">
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl p-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 mb-6 last:mb-0"
              >
                <div className="w-12 h-12 bg-gray-300 rounded-2xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded-xl animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded-xl animate-pulse w-1/2"></div>
                </div>
                <div className="w-20 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Modern Error Component
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            {/* Animated Error Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="relative">
                <FiAlertCircle className="w-10 h-10 text-red-500 animate-pulse" />
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Unable to Load {activeTab === "users" ? "Users" : "Subscribers"}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>

            {/* Modern Retry Button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentData = activeTab === "users" ? users : subscribers;
  const dataCount = currentData.length;
  const filteredCount = filteredData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <img
            src="/Logo.jpg"
            alt="AS Ecommerce Logo"
            className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-lg"
          />
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">
            AS <span className="text-yellow-400">Ecommerce</span> Admin
          </h1>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {activeTab === "users"
                  ? "User Management"
                  : "Subscriber Management"}
              </h1>
              <p className="text-gray-600 mt-2">
                {activeTab === "users"
                  ? `Managing ${dataCount} user${dataCount !== 1 ? "s" : ""}`
                  : `Managing ${dataCount} subscriber${
                      dataCount !== 1 ? "s" : ""
                    }`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Modern Refresh Button */}
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-5 py-2.5 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <FiRefreshCw className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                Refresh
              </button>
            </div>
          </div>

          {/* Modern Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-1 mb-8">
            <div className="flex space-x-1">
              <button
                onClick={() => handleTabChange("users")}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === "users"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                <FiUsers className="w-4 h-4 mr-2" />
                Users ({users.length})
              </button>
              <button
                onClick={() => handleTabChange("subscribers")}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === "subscribers"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                <FiList className="w-4 h-4 mr-2" />
                Subscribers ({subscribers.length})
              </button>
            </div>
          </div>

          {/* Modern Search Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  activeTab === "users"
                    ? "Search users by name, email, phone, city, or zip code..."
                    : "Search subscribers by email, plan, or status..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Modern Data Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {activeTab === "users" ? (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User Information
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Location
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Subscriber Information
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Subscription Details
                        </th>
                      </>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50/50 transition-all duration-200 group"
                      >
                        {activeTab === "users" ? (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                  <FiUser className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {item.firstName} {item.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">
                                    ID: {item._id?.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-900">
                                  <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                                  {item.email}
                                </div>
                                {item.phone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                                    {item.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                {item.address && (
                                  <div className="flex items-start text-sm text-gray-600">
                                    <FiMapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="leading-tight">
                                      {item.address}
                                    </span>
                                  </div>
                                )}
                                {(item.city || item.zipCode) && (
                                  <div className="text-xs text-gray-500 ml-6">
                                    {item.city && <span>{item.city}</span>}
                                    {item.city && item.zipCode && (
                                      <span>, </span>
                                    )}
                                    {item.zipCode && (
                                      <span>{item.zipCode}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-lg ${
                                    item.paid
                                      ? "bg-gradient-to-br from-purple-500 to-pink-600"
                                      : "bg-gradient-to-br from-green-500 to-emerald-600"
                                  }`}
                                >
                                  {item.paid ? (
                                    <FiCreditCard className="w-6 h-6 text-white" />
                                  ) : (
                                    <FiMail className="w-6 h-6 text-white" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {item.email}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">
                                    ID: {item._id?.substring(0, 8)}...
                                  </div>
                                  {item.paid && (
                                    <div className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full mt-1 inline-block">
                                      💎 Premium
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                                  <div>
                                    <div>
                                      Subscribed: {formatDate(item.createdAt)}
                                    </div>
                                    {item.date && (
                                      <div className="text-xs text-gray-500">
                                        Original: {formatDate(item.date)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {item.validTill && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <FiCalendar className="w-3 h-3 mr-2 text-blue-500" />
                                    Valid Till: {formatDate(item.validTill)}
                                  </div>
                                )}
                                {item.plan && (
                                  <div className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full inline-block">
                                    Plan: {item.plan}
                                  </div>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {/* Modern View Button */}
                            <button
                              onClick={() => handleViewItem(item)}
                              className="inline-flex items-center p-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 group"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {/* Modern Delete Button */}
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deleteLoading === item._id}
                              className="inline-flex items-center p-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                              title={`Delete ${
                                activeTab === "users" ? "User" : "Subscriber"
                              }`}
                            >
                              {deleteLoading === item._id ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={activeTab === "users" ? 4 : 3}
                        className="px-6 py-16 text-center"
                      >
                        <div className="flex flex-col items-center">
                          {activeTab === "users" ? (
                            <FiUser className="w-16 h-16 text-gray-300 mb-4" />
                          ) : (
                            <FiMail className="w-16 h-16 text-gray-300 mb-4" />
                          )}
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            No {activeTab} found
                          </p>
                          <p className="text-gray-400 text-sm">
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : `No ${activeTab} available in the system`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modern Table Footer */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredCount}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {dataCount}
                  </span>{" "}
                  {activeTab}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 sm:mt-0 transition-colors duration-200 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modern User/Subscriber Details Modal */}
          {isUserModalOpen && selectedUser && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {activeTab === "users"
                          ? "User Details"
                          : "Subscriber Details"}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Complete {activeTab === "users" ? "user" : "subscriber"}{" "}
                        information
                      </p>
                    </div>
                    <button
                      onClick={() => setIsUserModalOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {activeTab === "users" ? (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.firstName}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.lastName}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.email}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Address Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.address || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.city || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ZIP Code
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.zipCode || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Subscriber Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {selectedUser.email}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <p
                              className={`p-3 rounded-xl border ${
                                selectedUser.paid
                                  ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 border-purple-200 font-semibold"
                                  : "bg-gray-50/50 text-gray-800 border-gray-200"
                              }`}
                            >
                              {selectedUser.paid
                                ? "💎 Premium Subscriber"
                                : "Free Subscriber"}
                            </p>
                          </div>
                          {selectedUser.plan && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Plan
                              </label>
                              <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                                {selectedUser.plan}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Subscription Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Subscription Date
                            </label>
                            <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                              {formatDateTime(
                                selectedUser.createdAt || selectedUser.date
                              )}
                            </p>
                          </div>
                          {selectedUser.validTill && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid Till
                              </label>
                              <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                                {formatDateTime(selectedUser.validTill)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {activeTab === "users" ? "User ID" : "Subscriber ID"}
                        </label>
                        <p className="text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-200 font-mono text-sm break-all">
                          {selectedUser._id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50/50">
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
