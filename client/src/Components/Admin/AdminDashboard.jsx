import React from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiShoppingCart, FiUsers, FiMessageSquare, FiShield, FiDatabase, FiXCircle, FiHome, FiArrowRight } from "react-icons/fi";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { useAuth } from "../../Context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!user) {
          setAccessDenied(true);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const token = await getAuth().currentUser.getIdToken();

        const response = await axios.get("http://localhost:5000/api/admin/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.isAdmin) {
          setIsAdmin(true);
          setAccessDenied(false);
        } else {
          setIsAdmin(false);
          setAccessDenied(true);
        }
      } catch (error) {
        console.error("Admin verification failed:", error.response?.data || error.message);
        setIsAdmin(false);
        setAccessDenied(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const quickActions = [
    { title: "Manage Products", description: "Add, edit, or remove products", icon: FiPackage, path: "/admin/manage-products", color: "blue" },
    { title: "View Orders", description: "Process and track orders", icon: FiShoppingCart, path: "/admin/orders", color: "green" },
    { title: "User Management", description: "Manage customer accounts", icon: FiUsers, path: "/admin/users", color: "purple" },
    { title: "Contact Messages", description: "View customer inquiries", icon: FiMessageSquare, path: "/admin/contacts", color: "orange" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { 
        bg: "bg-blue-50", 
        text: "text-blue-600", 
        border: "border-blue-200", 
        hover: "hover:bg-blue-100",
        gradient: "from-blue-500 to-blue-600",
        shadow: "shadow-blue-100"
      },
      green: { 
        bg: "bg-green-50", 
        text: "text-green-600", 
        border: "border-green-200", 
        hover: "hover:bg-green-100",
        gradient: "from-green-500 to-green-600",
        shadow: "shadow-green-100"
      },
      purple: { 
        bg: "bg-purple-50", 
        text: "text-purple-600", 
        border: "border-purple-200", 
        hover: "hover:bg-purple-100",
        gradient: "from-purple-500 to-purple-600",
        shadow: "shadow-purple-100"
      },
      orange: { 
        bg: "bg-orange-50", 
        text: "text-orange-600", 
        border: "border-orange-200", 
        hover: "hover:bg-orange-100",
        gradient: "from-orange-500 to-orange-600",
        shadow: "shadow-orange-100"
      },
      gray: { 
        bg: "bg-gray-50", 
        text: "text-gray-600", 
        border: "border-gray-200", 
        hover: "hover:bg-gray-100",
        gradient: "from-gray-500 to-gray-600",
        shadow: "shadow-gray-100"
      },
    };
    return colors[color] || colors.gray;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 flex items-center justify-center px-6 animate-fade-in">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 max-w-md w-full transform hover:scale-105 transition-transform duration-300">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <FiXCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FiHome className="w-5 h-5 mr-2" /> 
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 animate-fade-in">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src="/Logo.jpg"
                alt="AS Ecommerce Logo"
                className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-lg transform hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -inset-1 rounded-full blur opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                 AS Ecommerce
              </h1>
              <h2 className="font-semibold text-blue-200 text-lg">Admin Dashboard</h2>
              <p className="text-blue-200 mt-1 animate-pulse">Welcome back! Here's what's happening today.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-blue-500/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-400/30 transform hover:scale-105 transition-transform duration-300">
            <FiShield className="w-6 h-6 text-blue-300 animate-pulse" />
            <span className="text-lg font-semibold text-blue-100">Admin</span>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-4 w-8 h-8 bg-yellow-400 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-1/3 -right-4 w-6 h-6 bg-blue-400 rounded-full blur-lg animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <div className="border-b border-gray-200/50 px-8 py-6 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Quick Actions
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </h2>
                <p className="text-gray-600 mt-2">Manage your store efficiently</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg animate-pulse">
                <FiDatabase className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colorClasses = getColorClasses(action.color);
                return (
                  <Link 
                    key={index} 
                    to={action.path} 
                    className={`group block p-6 rounded-2xl border-2 ${colorClasses.border} ${colorClasses.bg} transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 hover:shadow-2xl ${colorClasses.shadow} relative overflow-hidden`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Animated background effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    {/* Icon with animation */}
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className={`p-3 rounded-xl ${colorClasses.bg} border ${colorClasses.border} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                        <Icon className={`w-6 h-6 ${colorClasses.text} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <FiArrowRight className={`w-5 h-5 ${colorClasses.text} opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className={`font-bold text-gray-900 text-lg mb-2 group-hover:text-gray-800 transition-colors duration-300 relative z-10`}>
                      {action.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed relative z-10">{action.description}</p>
                    
                    {/* Hover indicator */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div className={`w-2 h-2 rounded-full ${colorClasses.bg} animate-pulse`}></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Store Overview</h3>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-blue-100 mb-4">Your store is running smoothly. Check the quick actions above to manage different areas.</p>
            <div className="flex items-center text-blue-200 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-ping"></div>
              System Status: Operational
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Quick Tips</h3>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                Regularly check orders and update status
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                Monitor user activities and feedback
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
                Keep product inventory updated
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        /* Staggered animation for cards */
        .grid > * {
          opacity: 0;
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .grid > *:nth-child(1) { animation-delay: 0.1s; }
        .grid > *:nth-child(2) { animation-delay: 0.2s; }
        .grid > *:nth-child(3) { animation-delay: 0.3s; }
        .grid > *:nth-child(4) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;