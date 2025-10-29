import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Star, Check, Zap, Shield, Truck, Gift } from "lucide-react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

function PremiumPlans() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "For getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      buttonText: "Get Started",
      features: [
        "Up to 50 products",
        "Basic store setup",
        "Email support",
        "Standard shipping",
        "7-day returns",
      ],
      icon: Star,
      color: "gray",
    },
    {
      id: "premium",
      name: "Premium",
      description: "Best for growing businesses",
      monthlyPrice: 799,
      yearlyPrice: 7999,
      popular: true,
      buttonText: "Start Free Trial",
      features: [
        "Unlimited products",
        "Priority delivery (1-2 days)",
        "Free shipping on all orders",
        "24/7 priority support",
        "30-day return policy",
        "Exclusive discounts",
        "Loyalty rewards",
        "Advanced analytics",
      ],
      icon: Crown,
      color: "amber",
    },
  ];

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "1-2 day priority shipping",
    },
    {
      icon: Gift,
      title: "Free Shipping",
      description: "No shipping costs on any order",
    },
    {
      icon: Zap,
      title: "Exclusive Deals",
      description: "Special discounts for premium members",
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "24/7 dedicated customer support",
    },
  ];

  const getPrice = (plan) => {
    const price =
      billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    return price === 0 ? "Free" : `₹${price}`;
  };

  const getBillingText = (plan) => {
    if (plan.monthlyPrice === 0) return "Free forever";
    return billingCycle === "yearly" ? "per year" : "per month";
  };

  const handlePlanSelect = (planId) => {
    if (planId === "basic") {
      navigate("/signup");
    } else {
      navigate("/payment", { state: { plan: planId, billing: billingCycle } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple Pricing
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Choose the plan that works best for your business
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md font-medium ${
                billingCycle === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md font-medium ${
                billingCycle === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Yearly (Save 30%)
            </button>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 p-8 ${
                plan.popular ? "border-amber-300 shadow-lg" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="inline-block bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {getPrice(plan)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-gray-500 ml-2">
                      /{billingCycle === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">{getBillingText(plan)}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  plan.popular
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                } transition-colors`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Premium Benefits
            </h2>
            <p className="text-gray-600">
              Everything you need to grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-4">
                    <IconComponent className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of successful sellers today
          </p>
          <button
            onClick={() => handlePlanSelect("premium")}
            className="bg-amber-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            Start Free Trial
          </button>
          <p className="text-gray-400 text-sm mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PremiumPlans;
