import React from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiBox, FiHeart, FiTag } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 overflow-hidden">
      
      {/* Floating E-commerce Icons */}
      <FiShoppingCart className="absolute top-10 left-20 text-white text-4xl opacity-40 animate-float1" />
      <FiBox className="absolute bottom-20 right-10 text-white text-5xl opacity-30 animate-float2" />
      <FiHeart className="absolute top-1/3 right-1/4 text-white text-6xl opacity-25 animate-float3" />
      <FiTag className="absolute bottom-1/4 left-1/3 text-white text-5xl opacity-20 animate-float4" />

      {/* Glassmorphic Card */}
      <div className="relative z-10 text-center p-8 bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 animate-fade-in-up">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-white rounded-full p-3 shadow-lg animate-bounce-slow">
            <img 
              src="/Logo.jpg" 
              alt="Company Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* 404 Number */}
        <div className="relative mb-2">
          <h1 className="text-9xl font-black text-white opacity-90 tracking-tighter animate-pulse-slow">404</h1>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur-xl opacity-30 -z-10 animate-gradient-x"></div>
        </div>

        {/* Message */}
        <p className="text-2xl font-semibold text-white mt-4 mb-2 animate-fade-in-up">
          Oops! Page not found
        </p>
        <p className="text-white/70 max-w-md mx-auto mb-8 animate-fade-in-up delay-200">
          The page you are looking for doesn't exist or might have been moved to a new location.
        </p>

        {/* Action Button */}
        <Link
          to="/"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-1 animate-fade-in-up delay-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Go Back Home
        </Link>

        {/* Decorative Blurs */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float1"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float2"></div>
      </div>
    </div>
  );
}
