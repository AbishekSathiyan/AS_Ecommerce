import React, { useState, useEffect } from "react";
import {
  ShoppingCartIcon,
  UserIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  Bars3Icon,
  HomeIcon,
  InformationCircleIcon,
  TruckIcon,
  StarIcon,
  GiftIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Logo from "../../public/Logo.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { debounce } from "../utils/debounce";

const AS_EcommerceHeader = () => {
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { getTotalItems } = useCart();
  const cartItems = getTotalItems();

  const navigationItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Shop", href: "/shop", icon: ShoppingBagIcon },
    { name: "About", href: "/about", icon: InformationCircleIcon },
    { name: "Contact", href: "/contact", icon: ChatBubbleLeftRightIcon },
  ];

  const promotionItems = [
    { text: "Free shipping over ₹2500", icon: TruckIcon },
    { text: "Limited time offers", icon: StarIcon },
    { text: "10% off first order", icon: GiftIcon },
    { text: "Easy returns", icon: CubeIcon },
  ];

  useEffect(() => {
    const handleScroll = debounce(() => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHidden(false);
      }
      
      // Scrolled state for shadow
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    }, 10);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavigation = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const handleTopBarClose = () => setIsTopBarVisible(false);

  const isActiveRoute = (href) => location.pathname === href;

  return (
    <header
      className={`bg-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        isScrolled ? "shadow-xl backdrop-blur-lg bg-white/98 border-b border-gray-100" : "shadow-md border-b border-gray-200/80"
      }`}
    >
      {/* Top Bar - Premium Gradient */}
      {isTopBarVisible && (
        <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white py-2 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap space-x-8 text-xs font-semibold">
                {promotionItems.map((item, index) => (
                  <span key={index} className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    <item.icon className="h-3 w-3" />
                    {item.text}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleTopBarClose}
              className="ml-4 p-1 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Close promotion banner"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
          
          {/* Animated gradient border */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 animate-pulse"></div>
        </div>
      )}

      {/* Main Header - Premium Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo - Premium Styling */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <img
                src={Logo}
                alt="AS Ecommerce Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl object-cover group-hover:scale-110 transition-all duration-300 shadow-lg border-2 border-white"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                AS Ecommerce
              </span>
              <span className="text-[10px] text-gray-500 hidden sm:block font-medium">
                Premium Shopping Experience
              </span>
            </div>
          </div>

          {/* Desktop Navigation - Premium Styling */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 text-sm relative group ${
                    isActiveRoute(item.href)
                      ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 border border-transparent hover:border-gray-200"
                  }`}
                >
                  <IconComponent className={`h-4 w-4 transition-all duration-300 ${
                    isActiveRoute(item.href) ? "text-white" : "group-hover:scale-110"
                  }`} />
                  {item.name}
                  
                  {/* Hover effect */}
                  {!isActiveRoute(item.href) && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions - Premium Styling */}
          <div className="flex items-center space-x-2">
            {/* Profile */}
            <button
              onClick={() => handleNavigation("/profile")}
              className="p-2.5 text-gray-600 hover:text-white hover:bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl transition-all duration-300 relative group shadow-sm hover:shadow-lg hover:shadow-blue-500/25"
              aria-label="Profile"
            >
              <UserIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg z-50">
                Profile
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </button>

            {/* Cart */}
            <button
              onClick={() => handleNavigation("/cart")}
              className="p-2.5 text-gray-600 hover:text-white hover:bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl transition-all duration-300 relative group shadow-sm hover:shadow-lg hover:shadow-emerald-500/25"
              aria-label={`Cart with ${cartItems} items`}
            >
              <ShoppingCartIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-bounce border-2 border-white">
                  {cartItems > 99 ? "99+" : cartItems}
                </span>
              )}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg z-50">
                Cart ({cartItems})
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-600 hover:text-white hover:bg-gradient-to-r from-gray-600 to-gray-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg"
              aria-label="Menu"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Premium Styling */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-xl animate-slideDown">
          <div className="px-4 py-3 space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-300 font-medium group ${
                    isActiveRoute(item.href)
                      ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50"
                  }`}
                >
                  <IconComponent className={`h-5 w-5 transition-all duration-300 ${
                    isActiveRoute(item.href) ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                  }`} />
                  <span className="font-semibold">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add padding to body to account for fixed header */}
      <style>{`
        body {
          padding-top: ${isTopBarVisible ? '5rem' : '3.5rem'};
        }
        
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { 
          animation: marquee 30s linear infinite; 
        }

        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-slideDown { 
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.7; 
          }
        }
        .animate-pulse { 
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; 
        }
      `}</style>
    </header>
  );
};

export default AS_EcommerceHeader;