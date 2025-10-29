import { FiUser, FiShoppingBag } from "react-icons/fi";

function ProfileTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white rounded-2xl shadow-sm p-2 border border-slate-100">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 rounded-xl flex items-center ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            <FiUser className="mr-2" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 rounded-xl flex items-center ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            <FiShoppingBag className="mr-2" /> My Orders
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileTabs;
