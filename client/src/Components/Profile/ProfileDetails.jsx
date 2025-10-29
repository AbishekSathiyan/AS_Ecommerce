import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Edit3,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  CheckCircle,
  CreditCard,
  Calendar,
  Crown,
  Zap,
  Star,
  Gem,
  Sparkles,
  BadgeCheck,
  Infinity,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function ProfileDetails() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });
  const [subscription, setSubscription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fieldConfig = {
    firstName: { icon: User, label: "First Name", type: "text", editable: true },
    lastName: { icon: User, label: "Last Name", type: "text", editable: true },
    email: { icon: Mail, label: "Email Address", type: "email", editable: false },
    phone: { icon: Phone, label: "Phone Number", type: "tel", editable: true },
    address: { icon: MapPin, label: "Street Address", type: "text", editable: true },
    city: { icon: Building, label: "City", type: "text", editable: true },
    zipCode: { icon: MapPin, label: "ZIP Code", type: "text", editable: true },
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const API_URL = `${API_BASE}/auth/profile`;

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("📦 Profile API Response:", res.data);
      console.log("🔍 Subscription data:", res.data.subscription);
      
      // Set form data
      setFormData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        city: res.data.city || "",
        zipCode: res.data.zipCode || "",
      });
      
      // Set subscription data
      if (res.data.subscription) {
        setSubscription(res.data.subscription);
        console.log("✅ Subscription set:", res.data.subscription);
      } else {
        console.log("❌ No subscription data found");
        setSubscription(null);
      }
    } catch (err) {
      console.error("Profile fetch error:", err.response || err);
      if (err.response?.status === 401 || err.response?.status === 404) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please login to access your profile",
          confirmButtonColor: "#4f46e5",
        }).then(() => navigate("/login"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to load profile",
          confirmButtonColor: "#4f46e5",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      const token = await user.getIdToken();
      const payload = { ...formData };
      delete payload.email;

      const res = await axios.put(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Profile update response:", res.data);
      
      setFormData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        city: res.data.city || "",
        zipCode: res.data.zipCode || "",
      });
      
      setSubscription(res.data.subscription || null);
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile updated successfully!",
        confirmButtonColor: "#10b981",
        timer: 2000,
      });
    } catch (err) {
      console.error("Update profile error:", err.response || err.message);
      if (err.response?.status === 401 || err.response?.status === 404) {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please login to update your profile",
          confirmButtonColor: "#4f46e5",
        }).then(() => navigate("/login"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to update profile",
          confirmButtonColor: "#4f46e5",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to reload profile data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if subscription is active
  const isSubscriptionActive = (sub) => {
    if (!sub) return false;
    if (sub.paid && sub.validTill) {
      return new Date(sub.validTill) > new Date();
    }
    return sub.paid;
  };

  // Get days remaining
  const getDaysRemaining = (validTill) => {
    if (!validTill) return 0;
    const today = new Date();
    const validDate = new Date(validTill);
    const diffTime = validDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading || authLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Profile Information</h1>
              <p className="text-indigo-100 font-medium">Manage your personal details and subscription</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold border border-white/30"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!isEditing ? (
          <>
            {/* Profile Information */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-sans">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(fieldConfig).map(([key, config]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3 text-gray-600 mb-2">
                      <config.icon className="h-4 w-4" />
                      <span className="text-sm font-semibold uppercase tracking-wide">{config.label}</span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg pl-7">
                      {formData[key] || <span className="text-gray-400 italic">Not provided</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Subscription Section */}
            <div className={`rounded-2xl overflow-hidden border-2 ${
              subscription && isSubscriptionActive(subscription) 
                ? "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 shadow-lg" 
                : "bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 border-gray-200"
            }`}>
              {/* Subscription Header */}
              <div className={`p-6 ${
                subscription && isSubscriptionActive(subscription) 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                  : "bg-gradient-to-r from-slate-600 to-gray-600"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      subscription && isSubscriptionActive(subscription) 
                        ? "bg-amber-100 text-amber-600" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold tracking-tight ${
                        subscription && isSubscriptionActive(subscription) ? "text-white" : "text-white"
                      }`}>
                        {subscription ? "Premium Membership" : "Subscription Status"}
                      </h2>
                      <p className={`font-medium ${
                        subscription && isSubscriptionActive(subscription) ? "text-amber-100" : "text-gray-200"
                      }`}>
                        {subscription ? "Unlock exclusive features and benefits" : "Upgrade to access premium features"}
                      </p>
                    </div>
                  </div>
                  {subscription && isSubscriptionActive(subscription) && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Sparkles className="h-4 w-4 text-amber-200" />
                      <span className="text-white font-bold text-sm">ACTIVE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Content */}
              <div className="p-6">
                {subscription ? (
                  <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-center">
                      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
                        isSubscriptionActive(subscription) 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      }`}>
                        {isSubscriptionActive(subscription) ? (
                          <>
                            <BadgeCheck className="h-5 w-5" />
                            <span className="font-bold tracking-wide">Premium Active</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-5 w-5" />
                            <span className="font-bold tracking-wide">Subscription Expired</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <Gem className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Plan Type</h3>
                        <p className="text-2xl font-bold text-gray-900 capitalize">{subscription.plan}</p>
                        <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-semibold text-blue-600">PREMIUM</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-green-100 rounded-xl">
                            <Zap className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Status</h3>
                        <p className={`text-2xl font-bold ${
                          isSubscriptionActive(subscription) ? "text-green-600" : "text-amber-600"
                        }`}>
                          {isSubscriptionActive(subscription) ? "Active" : "Expired"}
                        </p>
                        {isSubscriptionActive(subscription) && (
                          <div className="mt-2 inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                            <Infinity className="h-3 w-3 text-green-500" />
                            <span className="text-xs font-semibold text-green-600">RUNNING</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-purple-100 rounded-xl">
                            <Calendar className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Valid Until</h3>
                        <p className="text-lg font-bold text-gray-900 leading-tight">
                          {formatDate(subscription.validTill)}
                        </p>
                        {isSubscriptionActive(subscription) && (
                          <p className="text-sm text-purple-600 font-semibold mt-1">
                            {getDaysRemaining(subscription.validTill)} days remaining
                          </p>
                        )}
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-indigo-100 rounded-xl">
                            <CreditCard className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Reference ID</h3>
                        <p className="text-xs font-mono text-gray-900 bg-gray-100 p-2 rounded-lg break-all">
                          {subscription.referenceId}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-full">
                          <Shield className="h-3 w-3 text-indigo-500" />
                          <span className="text-xs font-semibold text-indigo-600">SECURE</span>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    {isSubscriptionActive(subscription) && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-5">
                        <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Premium Benefits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-amber-800">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            Unlimited Access
                          </div>
                          <div className="flex items-center gap-2 text-amber-800">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            Priority Support
                          </div>
                          <div className="flex items-center gap-2 text-amber-800">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            Exclusive Features
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* No Subscription State */
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Upgrade to premium to unlock exclusive features, priority support, and enhanced experience.
                    </p>
                    <button 
                      onClick={() => navigate("/premium-plans")}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-bold text-lg"
                    >
                      Explore Premium Plans
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Edit Form */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(fieldConfig).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      <IconComponent className="h-4 w-4" /> {config.label}
                    </label>
                    <input
                      type={config.type}
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      disabled={!config.editable}
                      className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all font-medium ${
                        !config.editable
                          ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                          : "bg-white text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400"
                      }`}
                      placeholder={`Enter your ${config.label.toLowerCase()}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                <X className="h-5 w-5" /> Cancel
              </button>
            </div>
          </form>
        )}

        {/* Helper Text */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-blue-800 font-bold text-lg mb-2">Profile Information Tips</h4>
              <p className="text-blue-700 font-medium">
                Keep your information up to date for faster checkout and better delivery experience.
                Your email cannot be changed for security reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails;