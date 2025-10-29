import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const auth = getAuth();

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Success popup
  const showSuccessPopup = (email) => {
    Swal.fire({
      title: "Check Your Inbox! 💌",
      html: `
        <div class="text-center">
          <p class="mb-4 text-gray-600">We've sent a password reset link to:</p>
          <p class="font-medium text-pink-600 mb-6">${email}</p>
          <div class="bg-pink-50 rounded-xl p-4 border border-pink-200 text-left">
            <p class="text-sm text-pink-800 font-medium mb-2">Didn't receive the email?</p>
            <ul class="text-xs text-pink-700 list-disc list-inside space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>
        </div>
      `,
      icon: "info",
      background: "#fffdf9",
      width: "90%",
      padding: "2em",
      confirmButtonColor: "#ff6b95",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-pink-200",
        title: "text-2xl font-bold text-pink-700",
        htmlContainer: "text-gray-700 text-md",
        confirmButton: "px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all",
      },
    });
  };

  // Error popup
  const showErrorPopup = (message) => {
    Swal.fire({
      title: "Something Went Wrong 💔",
      html: `<p class="text-gray-700">${message}</p>`,
      icon: "error",
      background: "#fffaf7",
      width: "90%",
      padding: "2em",
      confirmButtonColor: "#ff6b95",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-pink-200",
        title: "text-2xl font-bold text-pink-700",
        content: "text-gray-700 text-md",
        confirmButton: "px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all",
      },
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      setError("");
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      showSuccessPopup(email);
    } catch (err) {
      let errorMessage = "An error occurred. Please try again.";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }
      
      setError(errorMessage);
      showErrorPopup(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50/50 to-rose-50/40 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100">
        {/* Decorative header strip */}
        <div className="h-2 bg-gradient-to-r from-pink-400 to-rose-500"></div>

        <div className="px-8 py-10">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-pink-600 hover:text-pink-500 mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Login
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl shadow-md mb-4">
              <FiMail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-pink-800 mb-2">
              Forgot Password?
            </h2>
            <p className="text-slate-600">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {emailSent ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Email Sent!
              </h3>
              <p className="text-slate-600 mb-6">
                We've sent a password reset link to <span className="font-medium text-pink-600">{email}</span>
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02] w-full"
              >
                Send Another Email
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 bg-pink-50 text-pink-700 rounded-xl border border-pink-200 flex items-center">
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

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-pink-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100"></span>
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600 text-sm">
                  Remember your password?{" "}
                  <a
                    href="/login"
                    className="font-medium text-pink-600 hover:text-pink-500"
                  >
                    Back to Login
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}