// Components/Profile/UserProfile.jsx
import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import ProfileHeader from "./ProfileHeader";
import ProfileDetails from "./ProfileDetails";
import OrderList from "./OrdersList";
import Footer from "../Footer";

function UserProfile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <ProfileHeader activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
        {activeTab === "profile" && <ProfileDetails user={user} />}
        {activeTab === "orders" && <OrderList />}
      </div>
      <Footer />
    </div>
  );
}

export default UserProfile;