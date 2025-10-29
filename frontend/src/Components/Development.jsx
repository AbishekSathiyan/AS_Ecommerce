import React from "react";
import {
  FiZap,
  FiLayers,
  FiStar,
  FiAward,
  FiUser,
  FiHome,
  FiCode,
  FiServer,
  FiMail,
  FiPenTool,
  FiCpu
} from "react-icons/fi";

const Development = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <FiZap className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Launching Soon!
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We're building something extraordinary. Get ready for an amazing
            experience!
          </p>
        </div>

        {/* Team Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: FiPenTool, role: "Design Team", status: "Finalizing UI/UX" },
            { icon: FiCode, role: "Frontend Team", status: "Building Components" },
            { icon: FiServer, role: "Backend Team", status: "API Development" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center"
              >
                <Icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{item.role}</h3>
                <p className="text-sm text-gray-400">{item.status}</p>
              </div>
            );
          })}
        </div>

      
        {/* Additional Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: FiStar, title: "Premium Quality", description: "Top-notch features and performance" },
            { icon: FiAward, title: "Award Winning", description: "Recognized for excellence" },
            { icon: FiCpu, title: "Advanced Tech", description: "Built with modern technology" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center"
              >
                <Icon className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-purple-500 rounded-lg transition-all duration-200 hover:bg-purple-500/10"
          >
            <FiHome className="w-4 h-4 mr-2" />
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default Development;
