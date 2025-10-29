import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AboutPage from "../pages/About";
import SignUpPage from "../pages/SignUp";
import Login from "../pages/Login";
import CartPage from "../pages/CartPage";
import UserProfile from "../pages/Profile";
import PremiumPlans from "../pages/PremiumPlans";
import ContactPage from "../pages/Contact";
import FAQPage from "../pages/FaqPage";
import Development from "../Components/Development";
import NotFound from "../pages/NotFound";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="home" element={<Home />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="login" element={<Login />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="profile" element={<UserProfile />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="premium-plans" element={<PremiumPlans />} />
      <Route path="shipping" element={<Development />} />
      <Route path="faq" element={<FAQPage />} />
      <Route path="privacy" element={<Development />} />
      <Route path="terms" element={<Development />} />
      <Route path="payment" element={<Development />} />
      <Route path="returns" element={<Development />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default UserRoutes;
