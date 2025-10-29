import React, { useState } from "react";
import SubscribePayment from "./SubscribePayment";
import {
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiShoppingBag,
  FiShield,
  FiHeadphones,
  FiCreditCard,
} from "react-icons/fi";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa"; // Using FaEnvelope instead

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePaymentSuccess = () => {
    setMessage("Subscribed successfully!");
    setEmail("");
    setEmailError("");
  };

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Shipping", href: "/shipping" },
    { name: "Returns", href: "/returns" },
    { name: "Premium Plans", href: "/premium-plans" },
  ];

  const categories = [
    { name: "Men's Fashion", href: "/category/mens" },
    { name: "Women's Fashion", href: "/category/womens" },
    { name: "Electronics", href: "/category/electronics" },
    { name: "Home & Kitchen", href: "/category/home" },
  ];

  const features = [
    { icon: FiShield, text: "Secure Payment" },
    { icon: FiShoppingBag, text: "Free Shipping" },
    { icon: FiHeadphones, text: "24/7 Support" },
    { icon: FiCreditCard, text: "Easy Returns" },
  ];

  const paymentMethods = ["Visa", "Mastercard", "Razorpay", "UPI"];

  const isEmailValid = email && validateEmail(email);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/Logo.jpg"
                alt="AS Ecommerce"
                className="w-8 h-8 rounded-full border border-yellow-400"
              />
              <h2 className="text-lg font-bold">
                AS <span className="text-yellow-400">Ecommerce</span>
              </h2>
            </div>
            <p className="text-gray-400 text-sm">
              Your one-stop destination for quality products at amazing prices.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <div className="flex flex-col space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                  <SubscribePayment
                    type="subscription"
                    email={email}
                    amount={299}
                    plan="monthly"
                    onPaymentSuccess={handlePaymentSuccess}
                    className={`px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors whitespace-nowrap min-w-[100px] ${
                      !isEmailValid ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!isEmailValid}
                  >
                    Subscribe
                  </SubscribePayment>
                </div>
                {emailError && (
                  <p className="text-red-400 text-xs">{emailError}</p>
                )}
              </div>

              {/* Features below input box */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-1">
                      <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {message && <p className="text-xs text-green-400">{message}</p>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <a
                    href={category.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Contact</h3>
            <div className="space-y-2 text-sm text-gray-400">
              {/* Location */}
              <div className="flex items-center space-x-2">
                <FiMapPin className="w-4 h-4 text-red-400" />
                <a
                  href="https://maps.app.goo.gl/C47xtFS7yjeMifp7A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white transition-colors"
                >
                  Ramanathapuram, India
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4 text-green-400" />
                <a 
                  href="tel:+917092085864" 
                  className="hover:underline hover:text-white transition-colors"
                >
                  +91 70920 85864
                </a>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center space-x-2">
                <FaWhatsapp className="w-4 h-4 text-green-500" />
                <a
                  href="https://wa.me/917092085864"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-2">
                <FaEnvelope className="w-4 h-4 text-blue-400" /> {/* Using FaEnvelope instead */}
                <a
                  href="mailto:abishek.sathiyan.2002@gmail.com"
                  className="hover:underline hover:text-white transition-colors"
                >
                  abishek.sathiyan.2002@gmail.com
                </a>
              </div>

              {/* Social Media */}
              <div className="pt-2">
                <div className="flex space-x-2">
                  {[
                    {
                      icon: FiFacebook,
                      href: "#",
                      color: "hover:text-blue-400",
                    },
                    {
                      icon: FiTwitter,
                      href: "#",
                      color: "hover:text-blue-300",
                    },
                    {
                      icon: FiInstagram,
                      href: "#",
                      color: "hover:text-pink-400",
                    },
                    { 
                      icon: FiYoutube, 
                      href: "#", 
                      color: "hover:text-red-400" 
                    },
                  ].map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`p-1.5 bg-gray-800 rounded text-gray-400 transition-colors ${social.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-gray-400 text-xs">
              © 2024 AS Ecommerce. All rights reserved.
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-xs">We accept:</span>
              <div className="flex space-x-2">
                {paymentMethods.map((method, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;