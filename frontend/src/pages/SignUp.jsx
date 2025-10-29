import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

// Reusable Input Field Component
const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  optional = false,
  colSpan = 1,
}) => (
  <div className={`col-span-1 ${colSpan === 2 ? "md:col-span-2" : ""}`}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {optional && <span className="text-gray-400">(optional)</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-opacity-30 ${
        error
          ? "border-red-400 focus:ring-red-400 focus:border-red-500"
          : "border-gray-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-indigo-400"
      }`}
    />
    {error && (
      <p className="text-red-500 text-sm mt-2 flex items-center animate-pulse">
        <svg
          className="w-4 h-4 mr-1.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    agreeToTerms: false,
    subscribe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [touched, setTouched] = useState({});

  // Field blur handler
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const fieldErrors = validateField(name, formData[name]);
    if (fieldErrors) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
    }
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Validate in real-time for better UX
    if (touched[name]) {
      const fieldErrors = validateField(name, newValue);
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }

    if (name === "password") checkPasswordStrength(newValue);
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength("");
      return;
    }

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const mediumRegex =
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

    if (strongRegex.test(password)) {
      setPasswordStrength("strong");
    } else if (mediumRegex.test(password)) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        break;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (formData.password !== value) return "Passwords do not match";
        break;
      case "phone":
        if (value && !/^\d{10}$/.test(value))
          return "Phone number must be 10 digits";
        break;
      case "address":
        if (!value.trim()) return "Address is required";
        break;
      case "city":
        if (!value.trim()) return "City is required";
        break;
      case "zipCode":
        if (!value.trim()) return "Zip code is required";
        if (!/^\d{6}(-\d{4})?$/.test(value)) return "Zip code is invalid";
        break;
      case "agreeToTerms":
        if (!value) return "You must agree to the terms and conditions";
        break;
      default:
        return null;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleAlert = (type, message) => {
    Swal.fire({
      title: type === "success" ? "Success!" : "Error",
      text: message,
      icon: type,
      confirmButtonText: "Ok",
      confirmButtonColor: type === "success" ? "#4f46e5" : "#ef4444",
      timer: type === "success" ? 4000 : undefined,
      timerProgressBar: type === "success",
      background: type === "success" ? "#f9fafb" : "#fef2f2",
      iconColor: type === "success" ? "#10b981" : "#ef4444",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show all errors
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return handleAlert("error", "Please fix the errors in the form.");
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log("Firebase user created:", user);

      if (!user.uid || !user.email) {
        throw new Error("Firebase authentication failed - missing user data");
      }

      // 2️⃣ Save user info in backend DB - FIXED FIELD NAMES
      const backendData = {
        uid: user.uid, // Changed from firebaseuid to uid to match backend
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: user.email, // Use verified email from Firebase
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        subscribe: formData.subscribe,
      };

      console.log("Sending to backend:", backendData);

      const response = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        backendData,
        {
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("Backend response:", response.data);

      handleAlert(
        "success",
        "Account created successfully! You can now log in."
      );

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        agreeToTerms: false,
        subscribe: false,
      });
      setErrors({});
      setPasswordStrength("");
      setTouched({});
    } catch (err) {
      console.error("Signup error:", err);

      // Handle specific Firebase errors
      let errorMessage = "Signup failed. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please use a different email or try logging in.";
      } else if (err.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please choose a stronger password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage =
          "Invalid email address. Please check your email and try again.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      handleAlert("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!passwordStrength) return null;

    return (
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">
            Password strength
          </span>
          <span className="text-xs font-medium">
            {passwordStrength === "weak" && (
              <span className="text-red-500">Weak</span>
            )}
            {passwordStrength === "medium" && (
              <span className="text-yellow-500">Medium</span>
            )}
            {passwordStrength === "strong" && (
              <span className="text-green-500">Strong</span>
            )}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              passwordStrength === "weak"
                ? "bg-red-400 w-1/3"
                : passwordStrength === "medium"
                ? "bg-yellow-400 w-2/3"
                : "bg-green-500 w-full"
            }`}
          ></div>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {passwordStrength === "weak" &&
            "Include uppercase, lowercase, numbers, and special characters"}
          {passwordStrength === "medium" &&
            "Could be stronger with more character variety"}
          {passwordStrength === "strong" && "Strong password!"}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6 animate-bounce-slow">
            <div className="w-24 h-24 bg-white rounded-full p-3 shadow-xl ring-2 ring-purple-400 ring-opacity-30 hover:ring-opacity-60 transition duration-500">
              <img
                src="/Logo.jpg"
                alt="Company Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-green-500 mb-2 font-poppins">
            AS <span className="text-blue-400">Ecommerce</span>
          </h1>

          <h2 className="mt-2 text-4xl font-bold text-gray-900 font-poppins bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create Your Account
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-md mx-auto">
            Join our community and start your journey with us
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
          <form
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <InputField
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.firstName}
            />

            <InputField
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.lastName}
            />

            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              colSpan={2}
            />

            <div>
              <InputField
                name="password"
                label="Password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
              />
              <PasswordStrengthIndicator />
            </div>

            <InputField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
            />

            <InputField
              name="address"
              label="Address"
              placeholder="Your full address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              colSpan={2}
            />

            <InputField
              name="city"
              label="City"
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.city}
            />

            <InputField
              name="zipCode"
              label="ZIP Code"
              placeholder="Enter ZIP code"
              value={formData.zipCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.zipCode}
            />

            <InputField
              name="phone"
              label="Phone"
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              optional={true}
            />

            {/* Checkboxes */}
            <div className="md:col-span-2 flex flex-col space-y-4">
              <label className="inline-flex items-start group cursor-pointer">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 transition-colors group-hover:border-indigo-400"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className="text-gray-700">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
                    >
                      Terms and Conditions
                    </a>
                  </span>
                </div>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm mt-1 flex items-center animate-pulse">
                  <svg
                    className="w-4 h-4 mr-1.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Create Account
                    <svg
                      className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200 hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;