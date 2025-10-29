import React from "react";
import { Routes, Route } from "react-router-dom";
import ManageProducts from "../Components/Admin/ManageProducts";
import AdminOrdersPage from "../Components/Admin/AdminOrders";
import AdminContacts from "../Components/Admin/AdminContacts";
import AdminDashboard from "../Components/Admin/AdminDashboard";
import ManageUsers from "../Components/Admin/ManageUsers";
import NotFound from "../pages/NotFound";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="" element={<AdminDashboard />} />

      {/* Manage Products */}
      <Route path="manage-products" element={<ManageProducts />} />
      <Route path="users" element={<ManageUsers />} />
   
      {/* Orders */}
      <Route path="orders" element={<AdminOrdersPage />} />

      {/* Contacts */}
      <Route path="contacts" element={<AdminContacts />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
