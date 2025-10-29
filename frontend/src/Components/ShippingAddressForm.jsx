import React, { useState, useEffect } from "react";
import { FiUser, FiHome, FiMapPin, FiMap, FiPhone, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ShippingAddressForm({ initialAddress = {}, onConfirm, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const [address, setAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "TamilNadu",
    zipCode: "",
    phone: "",
    ...initialAddress,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return setLoading(false);
      try {
        setLoading(true);
        const token = await user.getIdToken(true);
        const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profile = res.data;
        setUserData(profile);
        setAddress((prev) => ({
          fullName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          state: profile.state || prev.state || "TamilNadu",
          zipCode: profile.zipCode || prev.zipCode,
        }));
      } catch (err) {
        console.error("Error fetching profile:", err);
        Swal.fire({
          title: "⚠️ Notice",
          text: "Using default form. You can still proceed with checkout.",
          icon: "info",
          confirmButtonColor: "#4f46e5",
          timer: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    const errors = [];
    if (!address.fullName?.trim()) errors.push("Full Name");
    if (!address.address?.trim()) errors.push("Street Address");
    if (!address.city?.trim()) errors.push("City");
    if (!address.phone?.trim() || address.phone.length < 10) errors.push("Valid Phone Number (10+ digits)");

    if (errors.length > 0) {
      Swal.fire({
        title: "📋 Missing Information",
        html: `<ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul>`,
        icon: "warning",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    onConfirm(address);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="animate-spin h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4 flex items-center justify-center">
            <FiLoader className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Your Information</h3>
          <p className="text-gray-600">Fetching your saved address details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Shipping Address</h3>
          <p className="text-gray-600 text-sm">
            {userData ? "✅ Your saved address loaded" : "Where should we deliver your order?"}
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {[
            { name: "fullName", placeholder: "Full Name *", icon: <FiUser /> },
            { name: "phone", placeholder: "Phone Number *", icon: <FiPhone /> },
            { name: "address", placeholder: "Street Address *", icon: <FiHome /> },
            { name: "city", placeholder: "City *", icon: <FiMapPin /> },
            { name: "state", placeholder: "State", icon: <FiMap />, readOnly: true },
            { name: "zipCode", placeholder: "ZIP/Postal Code", icon: <FiMap /> },
          ].map((field) => (
            <div key={field.name}>
              <div className="flex items-center mb-1 text-gray-700">{field.icon}<span className="ml-2">{field.placeholder.replace(" *", "")}</span></div>
              <input
                type="text"
                name={field.name}
                value={address[field.name] || ""}
                onChange={handleChange}
                readOnly={field.readOnly || false}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${field.readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          {onCancel && <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium">Cancel</button>}
          <button onClick={handleConfirm} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium">Confirm Address</button>
        </div>
      </div>
    </div>
  );
}

export { ShippingAddressForm };
