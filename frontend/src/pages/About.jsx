import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import founderImage from "../assets/Founder.jpeg";
import Footer from "../Components/Footer";
const About = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleNavigation = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/home");
    }, 800);
  };

  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      title: "What We Offer",
      items: [
        "Extensive product catalog across multiple categories",
        "Secure payment gateway and streamlined checkout",
        "Reliable nationwide delivery network",
        "Customer-centric support ecosystem",
      ],
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-100",
      gradient: "bg-gradient-to-br from-blue-50/80 to-cyan-50/60",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Our Mission",
      description:
        "To transform the e-commerce landscape by delivering unparalleled value through innovative solutions, quality assurance, and customer-focused experiences.",
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-100",
      gradient: "bg-gradient-to-br from-purple-50/80 to-pink-50/60",
    },
  ];

  const benefits = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      text: "Verified Quality Standards",
      color: "from-emerald-500 to-green-500",
      bgColor: "hover:from-emerald-50/60 hover:to-green-50/40",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
          />
        </svg>
      ),
      text: "Hassle-Free Returns",
      color: "from-blue-500 to-cyan-500",
      bgColor: "hover:from-blue-50/60 hover:to-cyan-50/40",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      text: "Express Delivery",
      color: "from-orange-500 to-red-500",
      bgColor: "hover:from-orange-50/60 hover:to-red-50/40",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      text: "24/7 Support",
      color: "from-violet-500 to-purple-500",
      bgColor: "hover:from-violet-50/60 hover:to-purple-50/40",
    },
  ];

  return (
    <>
      <Header />
      {/* Enhanced Animated Cursor */}
      <div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference transition-transform duration-75 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
      >
        <div
          className={`absolute inset-0 bg-white rounded-full transition-all duration-200 backdrop-blur-sm ${
            hoveredElement ? "scale-150 opacity-90" : "scale-100 opacity-60"
          } ${
            hoveredElement === "cta"
              ? "!scale-200 !bg-gradient-to-r from-blue-400 to-cyan-400"
              : ""
          }`}
        ></div>
        <div
          className={`absolute inset-0 border-2 border-white/30 rounded-full animate-ping ${
            hoveredElement ? "opacity-50" : "opacity-0"
          }`}
        ></div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 z-50 flex items-center justify-center backdrop-blur-xl transition-all duration-1000">
          <div className="text-center text-white">
            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-light animate-pulse">
              Taking you to our marketplace...
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
        <div
          className={`max-w-6xl w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-white/20 transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Enhanced Header Section */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-16 px-6 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-grid-white/5 bg-[size:60px_60px]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-white/90 text-sm font-medium">
                  Trusted E-commerce Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                About AS_Ecommerce
              </h1>

              <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mb-6 rounded-full"></div>

              <p className="text-blue-100/90 text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
                Redefining online shopping through{" "}
                <span className="text-white font-semibold">innovation</span>,
                <span className="text-white font-semibold"> excellence</span>,
                and
                <span className="text-white font-semibold">
                  {" "}
                  customer-centric solutions
                </span>
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Enhanced Hero Text */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-light">
                Welcome to{" "}
                <span
                  className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent px-1 hover:scale-105 transition-transform duration-300 inline-block cursor-pointer"
                  onMouseEnter={() => setHoveredElement("brand")}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  AS_Ecommerce
                </span>
                , where cutting-edge technology meets exceptional customer
                service in a seamless shopping experience.
              </p>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group p-8 rounded-3xl backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform-gpu hover:scale-[1.02] hover:-translate-y-1 ${feature.gradient} animate-fade-in-up`}
                  style={{ animationDelay: `${index * 200}ms` }}
                  onMouseEnter={() => setHoveredElement(`feature-${index}`)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <div className="flex items-start mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mr-5 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                        {feature.title}
                      </h2>
                    </div>
                  </div>

                  {feature.items ? (
                    <ul className="space-y-4">
                      {feature.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-center text-gray-700 group-hover:text-gray-800 transition-colors duration-300"
                        >
                          <div
                            className={`w-7 h-7 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 text-lg leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced Benefits Grid */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-10 border border-white/50 shadow-lg mb-16 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  AS_Ecommerce
                </span>
                ?
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className={`text-center group p-6 rounded-2xl transition-all duration-500 transform-gpu hover:scale-105 hover:-translate-y-2 cursor-pointer backdrop-blur-sm border border-white/50 ${benefit.bgColor}`}
                    onMouseEnter={() => setHoveredElement(`benefit-${index}`)}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${benefit.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}
                    >
                      {benefit.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:bg-gradient-to-r group-hover:from-gray-800 group-hover:to-gray-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {benefit.text}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Founder Section */}
            <div
              className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl p-10 md:p-12 text-white mb-16 relative overflow-hidden group cursor-pointer transform-gpu hover:scale-[1.01] transition-all duration-700 backdrop-blur-sm"
              onMouseEnter={() => setHoveredElement("founder")}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
              <div className="absolute top-10 -right-10 w-72 h-72 bg-white/5 rounded-full blur-xl"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-xl"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center">
                <div className="lg:mr-12 mb-8 lg:mb-0 transform-gpu group-hover:scale-105 transition-transform duration-500">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <img
                      src={founderImage}
                      alt="Founder Abishek SK"
                      className="relative w-56 h-56 rounded-2xl border-4 border-white/20 shadow-2xl object-cover group-hover:border-cyan-300/50 transition-all duration-500"
                    />
                    <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center lg:text-left flex-1 transform-gpu group-hover:translate-x-2 transition-transform duration-500">
                  <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                    <span className="text-sm font-medium">Founder & CEO</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                    Abishek SK
                  </h2>
                  <p className="text-xl text-blue-100/90 leading-relaxed mb-8 max-w-2xl font-light">
                    "We believe in creating meaningful connections between
                    quality products and discerning customers. Our platform is
                    built on the foundation of trust, innovation, and relentless
                    pursuit of excellence in every aspect of the customer
                    journey."
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    {[
                      "Visionary Leadership",
                      "Tech Innovation",
                      "Customer First",
                    ].map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/20 group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Section */}
            <div className="text-center bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-10 border border-white/50 shadow-lg backdrop-blur-sm">
              <p className="text-3xl font-light text-gray-800 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied customers who trust us for their
                shopping needs
              </p>

              <button
                onClick={handleNavigation}
                disabled={isLoading}
                className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 inline-flex items-center px-12 py-5 rounded-2xl text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 group cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                onMouseEnter={() => setHoveredElement("cta")}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Begin Your Shopping Experience
                    <svg
                      className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-gray-600 mt-4 text-sm">
                Experience the future of e-commerce today
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .bg-grid-white\\/5 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }

        .transform-gpu {
          transform: translateZ(0);
        }

        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
        }

        .backdrop-blur-md {
          backdrop-filter: blur(12px);
        }
      `}</style>
    </>
  );
};

export default About;
