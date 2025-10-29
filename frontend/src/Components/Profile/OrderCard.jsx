import { useEffect, useState } from "react";
import { formatDate } from "./utils";
import {
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiUser,
  FiMapPin,
  FiShoppingBag,
  FiLoader,
  FiBox,
  FiCheckSquare,
  FiSettings,
  FiNavigation,
  FiHome
} from "react-icons/fi";
import { HiCurrencyRupee } from "react-icons/hi";
import { 
  MdPending, 
  MdOutlineInventory2, 
  MdLocalShipping, 
  MdDeliveryDining,
  MdPerson,
  MdLocationOn,
  MdAttachMoney
} from "react-icons/md";

function OrderCard({ order, isRefreshing = false }) {
  // Enhanced status steps with better icons
  const statusSteps = [
    { 
      key: "pending", 
      label: "Pending", 
      icon: MdPending,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    { 
      key: "confirmed", 
      label: "Confirmed", 
      icon: FiCheckSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    { 
      key: "processing", 
      label: "Processing", 
      icon: MdOutlineInventory2,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    { 
      key: "shipped", 
      label: "Shipped", 
      icon: MdLocalShipping,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200"
    },
    { 
      key: "delivered", 
      label: "Delivered", 
      icon: MdDeliveryDining,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
  ];

  const statusKeys = statusSteps.map((s) => s.key);

  const getStatus = () => {
    const dbStatus = (order.deliveryStatus || "pending").toLowerCase().trim();
    return statusKeys.includes(dbStatus) ? dbStatus : "pending";
  };

  const getIndexFromStatus = (status) => statusSteps.findIndex((s) => s.key === status);

  const [currentIndex, setCurrentIndex] = useState(getIndexFromStatus(getStatus()));
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setCurrentIndex(getIndexFromStatus(getStatus()));
  }, [order.deliveryStatus]);

  // Enhanced payment badge with animations
  const paymentBadge = () => {
    const method = order.paymentMethod?.toLowerCase() || "online";
    const isPaid = order.paymentStatus?.toLowerCase() === "paid";

    const config = {
      paid: {
        cod: { 
          icon: MdAttachMoney, 
          text: "COD Paid", 
          style: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-sm",
          animation: "animate-pulse-subtle"
        },
        online: { 
          icon: FiCreditCard, 
          text: "Paid Online", 
          style: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-sm",
          animation: "animate-bounce-subtle"
        },
      },
      unpaid: {
        cod: { 
          icon: FiXCircle, 
          text: "COD Unpaid", 
          style: "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-sm",
          animation: "animate-pulse"
        },
        online: { 
          icon: FiXCircle, 
          text: "Unpaid Online", 
          style: "bg-red-50 text-red-700 border-red-200 shadow-red-sm",
          animation: "animate-pulse"
        },
      },
    };

    const status = isPaid ? "paid" : "unpaid";
    const { icon: Icon, text, style, animation } = config[status][method] || config.unpaid.online;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border ${style} shadow-sm transition-all duration-300 hover:scale-105 ${animation}`}>
        <Icon className="w-4 h-4" /> {text}
      </span>
    );
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden group relative ${
        isRefreshing ? 'opacity-70 scale-95' : 'hover:scale-[1.02]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 opacity-0 transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : ''
      }`}></div>

      {/* Refresh Overlay with Enhanced Animation */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-blue-200 animate-pulse">
            <div className="relative">
              <FiLoader className="w-5 h-5 animate-spin text-blue-600" />
              <div className="absolute inset-0 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Updating order status...</span>
          </div>
        </div>
      )}

      {/* Header with Enhanced Design */}
      <div className="relative bg-gradient-to-r from-slate-50 to-gray-50/80 px-6 py-5 border-b border-gray-200/60">
        {/* Animated Accent Bar */}
        <div className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ${
          isHovered ? 'w-full' : 'w-1/2'
        }`}></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow duration-300">
                <FiShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              {/* Notification Dot */}
              {getStatus() === 'pending' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-xl tracking-tight">
                Order #{order.orderNumber || order._id?.slice(-8)?.toUpperCase() || "N/A"}
              </h3>
              <p className="text-sm text-gray-600 flex items-center mt-1 group-hover:text-gray-700 transition-colors">
                <FiClock className="w-4 h-4 mr-2 animate-pulse" />
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 hover:scale-105 ${
              getStatus() === "delivered" ? "bg-green-50 text-green-700 border-green-200 shadow-green-sm" :
              getStatus() === "processing" ? "bg-purple-50 text-purple-700 border-purple-200 shadow-purple-sm" :
              "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-sm"
            }`}>
              Delivery: {getStatus().charAt(0).toUpperCase() + getStatus().slice(1)}
            </span>
            {paymentBadge()}
          </div>
        </div>
      </div>

      {/* Enhanced Status Progress with Animations */}
      <div className="p-6 bg-gradient-to-b from-white to-gray-50/30">
        <div className="flex items-center justify-between relative">
          {statusSteps.map((step, idx) => {
            const completed = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const IconComponent = step.icon;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
                {/* Connection Line */}
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-1.5 z-0 transition-all duration-1000 ${
                      idx < currentIndex ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-200'
                    } ${completed ? 'animate-pulse-glow' : ''}`}
                    style={{ transform: 'translateX(50%)' }}
                  ></div>
                )}

                {/* Step Circle with Enhanced Animation */}
                <div className="relative">
                  <div
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl font-semibold text-lg border-2 transition-all duration-500 transform ${
                      completed 
                        ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200 scale-110' 
                        : isCurrent 
                          ? `${step.bgColor} ${step.borderColor} ${step.color} shadow-lg scale-110 animate-bounce-subtle` 
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                    } ${isHovered && isCurrent ? 'animate-pulse-glow' : ''}`}
                  >
                    {completed ? (
                      <FiCheckCircle className="w-6 h-6 animate-scale-in" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Progress Ring for Current Step */}
                  {isCurrent && (
                    <div className="absolute -inset-2 border-2 border-blue-300 rounded-2xl animate-ping-slow"></div>
                  )}
                </div>

                {/* Step Label */}
                <span className={`mt-3 text-sm font-semibold text-center transition-all duration-300 ${
                  completed ? 'text-green-600' : 
                  isCurrent ? 'text-blue-600 scale-105' : 
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>

                {/* Current Badge with Animation */}
                {isCurrent && (
                  <div className="mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium animate-pulse-subtle">
                    In Progress
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Grid with Enhanced Animations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
        {/* Order Items Section */}
        <div className="xl:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105">
              <FiPackage className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 text-lg">
              Order Items ({order.items?.length || 0})
            </h4>
          </div>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div 
                key={item._id || item.name} 
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-x-1 group/item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={item.image || "https://dummyimage.com/80x80/e5e7eb/111827&text=📦"}
                      alt={item.name || "Product"}
                      className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 group-hover/item:border-blue-300 transition-all duration-300"
                    />
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-bounce-subtle">
                      {item.quantity}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                      {item.name}
                    </p>
                    {item.price && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <HiCurrencyRupee className="inline w-4 h-4 mr-1" />
                        {item.price.toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
                {item.price && (
                  <span className="font-bold text-gray-900 text-lg group-hover/item:text-green-600 transition-colors">
                    <HiCurrencyRupee className="inline w-5 h-5 mr-1" />
                    {(item.price * item.quantity).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Summary Section */}
        <div className="space-y-5">
          {/* Customer Info Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                <MdPerson className="w-5 h-5 text-green-600" />
              </div>
              <h5 className="font-semibold text-gray-900">Customer Details</h5>
            </div>
            <p className="font-bold text-gray-900 text-lg mb-2">{order.shippingAddress?.fullName || "N/A"}</p>
            {order.shippingAddress?.email && (
              <p className="text-sm text-gray-600 mb-3">{order.shippingAddress.email}</p>
            )}
            {order.shippingAddress?.address && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MdLocationOn className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span className="line-clamp-2">{order.shippingAddress.address}</span>
              </div>
            )}
          </div>

          {/* Total Amount Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group/summary">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover/summary:scale-110 transition-transform">
                <HiCurrencyRupee className="w-5 h-5 text-blue-600" />
              </div>
              <h5 className="font-semibold text-gray-900">Total Amount</h5>
            </div>
            <p className="text-3xl font-bold text-gray-900 flex items-center gap-2 group-hover/summary:text-green-600 transition-colors">
              <HiCurrencyRupee className="text-green-600 w-7 h-7" />
              {order.totalAmount?.toFixed(2) || "0.00"}
            </p>
            {order.items?.length > 0 && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                <FiBox className="w-4 h-4" />
                {order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)} items total
              </p>
            )}
          </div>

          {/* Estimated Delivery */}
          {order.estimatedDelivery && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 text-amber-800">
                <FiClock className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Estimated Delivery: {formatDate(order.estimatedDelivery)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add these custom animations to your CSS
const customStyles = `
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
@keyframes scale-in {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
@keyframes ping-slow {
  75%, 100% { transform: scale(1.5); opacity: 0; }
}
.animate-pulse-glow { animation: pulse-glow 2s infinite; }
.animate-bounce-subtle { animation: bounce-subtle 2s infinite; }
.animate-scale-in { animation: scale-in 0.3s ease-out; }
.animate-ping-slow { animation: ping-slow 3s cubic-bezier(0,0,0.2,1) infinite; }
.animate-pulse-subtle { animation: pulse 3s infinite; }
.shadow-green-sm { box-shadow: 0 2px 8px -1px rgba(16, 185, 129, 0.2); }
.shadow-blue-sm { box-shadow: 0 2px 8px -1px rgba(59, 130, 246, 0.2); }
.shadow-purple-sm { box-shadow: 0 2px 8px -1px rgba(139, 92, 246, 0.2); }
.shadow-amber-sm { box-shadow: 0 2px 8px -1px rgba(245, 158, 11, 0.2); }
.shadow-red-sm { box-shadow: 0 2px 8px -1px rgba(239, 68, 68, 0.2); }
`;

// Don't forget to inject these styles into your application
// You can add this to your global CSS or use a CSS-in-JS solution

export default OrderCard;