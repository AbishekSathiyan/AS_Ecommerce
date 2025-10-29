import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../Context/AuthContext";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiUser,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function Login() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();

  // Extract username from email
  const getUsernameFromEmail = (email) => {
    return email.split("@")[0];
  };

  // Updated color-themed success popup
  const showSuccessPopup = (email) => {
    const username = getUsernameFromEmail(email);

    Swal.fire({
      title: `Welcome Back, ${username}!`,
      html: `
        <div class="text-center">
          <p class="mb-4 text-gray-600">You have successfully signed in to your account.</p>
          <div class="flex justify-center space-x-6 mb-4">
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span class="text-xs text-gray-600">Shopping</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span class="text-xs text-gray-600">Cart</span>
            </div>
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span class="text-xs text-gray-600">Deals</span>
            </div>
          </div>
          <p class="text-indigo-600 font-medium">Happy Shopping!</p>
        </div>
      `,
      icon: "success",
      background: "#faf7ff",
      width: "90%",
      padding: "2em",
      confirmButtonColor: "#6366f1",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-indigo-100",
        title: "text-2xl font-bold text-indigo-700",
        htmlContainer: "text-gray-700 text-md",
        confirmButton:
          "px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all",
      },
      imageUrl:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: "Heart Icon",
    });
  };

  // Updated color-themed error popup
  const showErrorPopup = (message) => {
    Swal.fire({
      title: "Oops! Something went wrong",
      html: `<p class="text-gray-700">${message}</p>`,
      icon: "error",
      background: "#fef7ff",
      width: "90%",
      padding: "2em",
      confirmButtonColor: "#6366f1",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-indigo-100",
        title: "text-2xl font-bold text-indigo-700",
        content: "text-gray-700 text-md",
        confirmButton:
          "px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all",
      },
    });
  };

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!validateEmail(email)) {
      showErrorPopup("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      showErrorPopup("Password must be at least 6 characters long");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      showSuccessPopup(email);
    } catch (err) {
      let errorMessage = "An error occurred during sign in. Please try again.";

      if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/user-not-found") {
        errorError = "No account found with this email address.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }

      setError(errorMessage);
      showErrorPopup(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    const username = getUsernameFromEmail(user.email);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/40 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center border border-indigo-100">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <FiUser className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-indigo-800 mb-2">
            Welcome Back, {username}!
          </h3>
          <p className="text-slate-600 mb-6">
            You are already logged in as{" "}
            <span className="font-medium text-indigo-600">{user.email}</span>
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02] w-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/40 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-100">
        {/* Decorative header strip */}
        <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500"></div>

        <div className="px-8 py-10">
          <div className="text-center mb-8">
            {/* Logo container with improved styling */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full p-3 shadow-xl ring-2 ring-purple-400 ring-opacity-30 hover:ring-opacity-60 transition duration-500">
                <img
                  src="/Logo.jpg"
                  alt="Company Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-indigo-800 mb-2">
              Welcome Back!
            </h2>
            <p className="text-slate-600">
              Sign in to your account to continue shopping
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200 flex items-center">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-indigo-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-indigo-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-indigo-400 hover:text-indigo-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-indigo-400 hover:text-indigo-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-indigo-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-slate-700"
                >
                  Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100"></span>
              <span className="relative flex items-center">
                {isLoading ? (
                  <>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    <FiLogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
