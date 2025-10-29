import React, { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const faqCategories = [
    { id: "all", name: "All Questions", count: 28 },
    { id: "shipping", name: "Shipping & Delivery", count: 8 },
    { id: "returns", name: "Returns & Refunds", count: 6 },
    { id: "payments", name: "Payments", count: 5 },
    { id: "account", name: "Account & Orders", count: 4 },
    { id: "products", name: "Products", count: 5 },
  ];

  const faqItems = [
    // Shipping & Delivery
    {
      id: 1,
      question: "What are your shipping options and delivery times?",
      answer:
        "We offer standard shipping (3-5 business days) for ₹99, express shipping (1-2 business days) for ₹199, and free shipping on orders over ₹2500. Orders placed before 2 PM IST are processed the same day. Delivery times may vary based on your location and product availability.",
      category: "shipping",
      popular: true,
    },
    {
      id: 2,
      question: "Do you ship internationally?",
      answer:
        "Currently, we only ship within India. We're working on expanding our international shipping options and will announce them soon on our website and social media channels.",
      category: "shipping",
    },
    {
      id: 3,
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order by logging into your account and visiting the 'Order History' section. Our tracking system updates every 4-6 hours.",
      category: "shipping",
      popular: true,
    },
    {
      id: 4,
      question: "What happens if I'm not available during delivery?",
      answer:
        "Our delivery partner will attempt delivery twice. If you're unavailable both times, the package will be held at the nearest delivery center for 3 days. You'll receive instructions for pickup or rescheduling via SMS and email.",
      category: "shipping",
    },

    // Returns & Refunds
    {
      id: 5,
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items. Products must be in original condition with tags attached and in the original packaging. Some items like electronics have a 7-day return window. Customized products and personal care items are not returnable unless defective.",
      category: "returns",
      popular: true,
    },
    {
      id: 6,
      question: "How long do refunds take to process?",
      answer:
        "Once we receive your return, it takes 2-3 business days to process. Refunds are issued to your original payment method and may take 5-10 business days to appear in your account, depending on your bank.",
      category: "returns",
    },

    // Payments
    {
      id: 7,
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI payments, net banking, and popular digital wallets like Paytm, PhonePe, and Google Pay. We also offer EMI options for orders above ₹5000.",
      category: "payments",
      popular: true,
    },
    {
      id: 8,
      question: "Is it safe to use my credit card on your website?",
      answer:
        "Absolutely! We use 256-bit SSL encryption to protect your payment information. We are PCI-DSS compliant and do not store your credit card details on our servers. All transactions are processed through secure payment gateways.",
      category: "payments",
    },

    // Account & Orders
    {
      id: 9,
      question: "How do I create an account?",
      answer:
        "Click on the 'Sign Up' button in the top right corner, enter your email address, create a password, and verify your email. You can also sign up using your Google account for faster registration.",
      category: "account",
    },
    {
      id: 10,
      question: "Can I modify or cancel my order after placing it?",
      answer:
        "You can modify or cancel your order within 1 hour of placing it from your account dashboard. After 1 hour, the order enters processing and cannot be modified. Contact our support team immediately if you need assistance.",
      category: "account",
      popular: true,
    },

    // Products
    {
      id: 11,
      question: "Are your products authentic and genuine?",
      answer:
        "Yes! We are an authorized retailer for all the brands we carry. Every product is sourced directly from brands or their authorized distributors. We provide authenticity guarantees and manufacturer warranties where applicable.",
      category: "products",
      popular: true,
    },
    {
      id: 12,
      question: "Do you offer product warranties?",
      answer:
        "Most electronics and appliances come with manufacturer warranties ranging from 1-2 years. Fashion items and accessories have quality guarantees. Warranty details are provided with each product and can be claimed through our customer support.",
      category: "products",
    },
  ];

  const filteredItems = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const popularQuestions = faqItems.filter((item) => item.popular);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="pt-24 pb-16"> {/* Added padding to account for fixed header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about shopping, shipping,
              returns, and more.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
              />
            </div>
          </div>

          {/* Popular Questions */}
          {searchTerm === "" && activeCategory === "all" && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Popular Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {popularQuestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="text-left p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-lg">
                        {item.question}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Popular
                        </span>
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                            openItems[item.id] ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                    {openItems[item.id] && (
                      <div className="mt-4 text-gray-600 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-32"> {/* Increased top position */}
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                  Categories
                </h3>
                <div className="space-y-2">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex justify-between items-center ${
                        activeCategory === category.id
                          ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          activeCategory === category.id
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="lg:w-3/4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16">
                    <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full text-left flex justify-between items-start space-x-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {item.question}
                              </h3>
                              {item.popular && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            {openItems[item.id] && (
                              <p className="text-gray-600 leading-relaxed mt-3">
                                {item.answer}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {openItems[item.id] ? (
                              <ChevronUpIcon className="h-6 w-6 text-blue-600" />
                            ) : (
                              <ChevronDownIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
              <p className="text-blue-100 text-lg">
                Our support team is here to help you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <PhoneIcon className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-blue-100">+91 98765 43210</p>
                <p className="text-sm text-blue-200 mt-1">Mon-Sun, 9AM-9PM</p>
              </div>

              <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <EnvelopeIcon className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-blue-100">support@asecommerce.com</p>
                <p className="text-sm text-blue-200 mt-1">24/7 Support</p>
              </div>

              <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-blue-100">Available 24/7</p>
                <p className="text-sm text-blue-200 mt-1">Instant Help</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <ClockIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">30 Days</div>
              <div className="text-gray-600">Return Policy</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">Free</div>
              <div className="text-gray-600">Shipping Over ₹2500</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-gray-600">Authentic Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FAQPage;