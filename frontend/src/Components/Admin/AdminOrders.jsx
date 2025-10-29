import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiRefreshCw,
  FiXCircle,
  FiEye,
  FiCheckCircle,
  FiLoader,
  FiPackage,
  FiTruck
} from "react-icons/fi";
import { useAuth } from "../../Context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const orderSteps = [
  { status: "pending", label: "Pending", icon: FiLoader, bgColor: "bg-purple-50", textColor: "text-purple-700" },
  { status: "confirmed", label: "Confirmed", icon: FiCheckCircle, bgColor: "bg-blue-50", textColor: "text-blue-700" },
  { status: "shipped", label: "Shipped", icon: FiTruck, bgColor: "bg-amber-50", textColor: "text-amber-700" },
  { status: "delivered", label: "Delivered", icon: FiPackage, bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
  { status: "cancelled", label: "Cancelled", icon: FiXCircle, bgColor: "bg-rose-50", textColor: "text-rose-700" }
];

const AdminOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const res = await axios.get(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const token = await user.getIdToken(true);
      await axios.patch(
        `${API_BASE}/admin/orders/${orderId}/delivery-status`,
        { deliveryStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh the orders from backend after update
      await fetchOrders();

      Swal.fire("Success", `Order status changed to ${newStatus}`, "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update order status", "error");
    } finally {
      setUpdatingOrder(null);
      setIsModalOpen(false);
    }
  };

  const openOrderDetails = (order) => { setSelectedOrder(order); setIsModalOpen(true); };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Order Management</h1>
      <button
        onClick={fetchOrders}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-white border rounded-lg flex items-center"
      >
        <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Orders
      </button>

      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-6 py-2 bg-gray-50 font-semibold border-b">
            <span>Customer</span>
            <span>Order ID</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-gray-200">
            {orders.map(order => {
              const step = orderSteps.find(s => s.status === order.status);
              return (
                <div key={order._id} className="grid grid-cols-6 gap-4 px-6 py-3 items-center hover:bg-gray-50">
                  <div>{order.shippingAddress?.fullName || "Unknown"}</div>
                  <div>{order.razorpay_order_id}</div>
                  <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div>₹{order.totalPrice?.toLocaleString()}</div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full border ${step?.bgColor} ${step?.textColor}`}>
                    {order.status}
                  </div>
                  <div>
                    <button onClick={() => openOrderDetails(order)} className="text-blue-600"><FiEye /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button onClick={() => setIsModalOpen(false)}><FiXCircle /></button>
            </div>

            <p><strong>Order ID:</strong> {selectedOrder.razorpay_order_id}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
            <p><strong>Total Amount:</strong> ₹{selectedOrder.totalPrice?.toLocaleString()}</p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items:</h3>
              {selectedOrder.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 border-b py-2">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{item.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              {orderSteps.map(step => (
                <button
                  key={step.status}
                  onClick={() => handleStatusUpdate(selectedOrder._id, step.status)}
                  disabled={selectedOrder.status === step.status || updatingOrder === selectedOrder._id}
                  className={`px-4 py-2 border rounded-lg ${selectedOrder.status === step.status ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
