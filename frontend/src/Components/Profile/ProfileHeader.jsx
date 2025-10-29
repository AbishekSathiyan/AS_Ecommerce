// Components/Profile/ProfileHeader.jsx
import { FiUser, FiShoppingBag } from "react-icons/fi";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function ProfileHeader({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear any stored user data (localStorage/sessionStorage)
      localStorage.removeItem("user"); // if you store user info
      sessionStorage.clear();

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "profile" ? "bg-indigo-600 text-white" : "bg-gray-200"
          } flex items-center`}
        >
          <FiUser className="mr-2" /> Profile
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "orders" ? "bg-indigo-600 text-white" : "bg-gray-200"
          } flex items-center`}
        >
          <FiShoppingBag className="mr-2" /> Orders
        </button>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium"
      >
        Logout
      </button>
    </div>
  );
}

export default ProfileHeader;
