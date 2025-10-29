// src/Pages/Home.jsx
import { useState, useRef, useEffect } from "react";
import CProductPage from "./CProductsPage";
import Banner1 from "../assets/Banner1.jpg";
import Banner2 from "../assets/Banner2.jpg";
import Banner3 from "../assets/Banner3.jpg";
import Banner4 from "../assets/Banner4.jpg";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

function Home() {
  const [cartItems, setCartItems] = useState([]);
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);
  const featuredProductsRef = useRef(null);
  const intervalRef = useRef(null);
  const featuredIntervalRef = useRef(null);

  // Sample Featured Products - optimized with proper images
  const featuredProducts = [
    {
      _id: "1",
      name: "iPhone 16 Pro",
      price: 129999,
      images: [
        "https://lifemobile.lk/wp-content/uploads/2024/09/16-pro-3-600x600.jpg",
      ],
      category: "Electronics",
      rating: 4.8,
      reviews: 1245,
    },
    {
      _id: "2",
      name: "Samsung Galaxy A15",
      price: 89999,
      images: [
        "https://tse3.mm.bing.net/th/id/OIP.0nX31beKhkjVXb3f_WbMJwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
      ],
      category: "Electronics",
      rating: 4.6,
      reviews: 892,
    },
    {
      _id: "3",
      name: "Sony WH-1000XM5",
      price: 29999,
      images: [
        "https://d3d71ba2asa5oz.cloudfront.net/12021657/images/175130__wws1.jpg",
      ],
      category: "Audio",
      rating: 4.7,
      reviews: 1567,
    },
    {
      _id: "4",
      name: "Nike Air Max 270",
      price: 7999,
      images: ["https://i8.amplience.net/i/jpl/jd_022837_a?qlt=92"],
      category: "Fashion",
      rating: 4.5,
      reviews: 2341,
    },
    {
      _id: "5",
      name: 'MacBook Pro 16"',
      price: 199999,
      images: [
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-silver-select-202301?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1671304673223",
      ],
      category: "Electronics",
      rating: 4.9,
      reviews: 987,
    },
    {
      _id: "6",
      name: "Premium Grocery Pack",
      price: 2899,
      images: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvY2VyeXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
      ],
      category: "Grocery",
      rating: 4.6,
      reviews: 567,
    },
    {
      _id: "7",
      name: "Canon EOS R5",
      price: 259999,
      images: [
        "https://tse3.mm.bing.net/th/id/OIP.7bLo7pNPDoXQMPJWqcdOCgAAAA?w=474&h=412&rs=1&pid=ImgDetMain&o=7&rm=3",
      ],
      category: "Electronics",
      rating: 4.8,
      reviews: 432,
    },
    {
      _id: "8",
      name: "Designer Leather Bag",
      price: 12999,
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVzaWduZXIlMjBiYWd8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
      ],
      category: "Fashion",
      rating: 4.4,
      reviews: 789,
    },
  ];

  // Local banner images
  const bannerImages = [Banner1, Banner2, Banner3, Banner4];

  // Auto-scroll banner
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bannerImages.length;
        if (scrollRef.current) {
          const container = scrollRef.current;
          const imageWidth = container.children[0]?.offsetWidth || 0;
          const gap = 24;
          const scrollAmount = (imageWidth + gap) * nextIndex;
          container.scrollTo({ left: scrollAmount, behavior: "smooth" });
        }
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, bannerImages.length]);

  // Manual banner scroll sync
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const imageWidth = container.children[0]?.offsetWidth || 0;
      const gap = 24;
      const scrollPos = container.scrollLeft;
      const newIndex = Math.round(scrollPos / (imageWidth + gap));
      if (newIndex >= 0 && newIndex < bannerImages.length) {
        setCurrentIndex(newIndex);
      }
    };
    const container = scrollRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [bannerImages.length]);

  // Add to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Manual scroll for featured products
  const scrollFeatured = (direction) => {
    if (featuredProductsRef.current) {
      const scrollAmount = 280; // Reduced scroll amount
      featuredProductsRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll featured products
  useEffect(() => {
    featuredIntervalRef.current = setInterval(() => {
      if (!featuredProductsRef.current) return;
      const container = featuredProductsRef.current;
      const scrollAmount = 280; // Reduced scroll amount
      if (
        container.scrollLeft + container.offsetWidth >=
        container.scrollWidth - 50
      ) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(featuredIntervalRef.current);
  }, []);

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-3 h-3 ${ // Smaller stars
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Banner */}
      <header />
      <Header />
      <div className="relative w-full my-8 group px-4">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 rounded-2xl shadow-lg"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {bannerImages.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-72 md:h-96 rounded-2xl overflow-hidden snap-start relative"
            >
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Diwali Sale
                  </h2>
                  <p className="text-lg md:text-xl">
                    Up to 50% off on selected items
                  </p>
                  <button className="mt-4 bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300"
              }`}
              onClick={() => {
                setCurrentIndex(index);
                if (scrollRef.current) {
                  const container = scrollRef.current;
                  const imageWidth = container.children[0]?.offsetWidth || 0;
                  const gap = 24;
                  const scrollAmount = (imageWidth + gap) * index;
                  container.scrollTo({
                    left: scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Modern Featured Products - Reduced Size */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="flex items-center justify-between mb-6"> {/* Reduced margin */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900"> {/* Smaller heading */}
              Featured Products
            </h2>
            <p className="text-gray-600 mt-1 text-sm"> {/* Smaller text */}
              Discover our most popular items
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => scrollFeatured("left")}
              className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200" // Smaller button
            >
              <svg
                className="w-5 h-5" // Smaller icon
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scrollFeatured("right")}
              className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200" // Smaller button
            >
              <svg
                className="w-5 h-5" // Smaller icon
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={featuredProductsRef}
          className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x snap-mandatory" // Reduced gap and padding
          onMouseEnter={() => clearInterval(featuredIntervalRef.current)}
          onMouseLeave={() => {
            featuredIntervalRef.current = setInterval(() => {
              if (!featuredProductsRef.current) return;
              const container = featuredProductsRef.current;
              const scrollAmount = 280; // Reduced scroll amount
              if (
                container.scrollLeft + container.offsetWidth >=
                container.scrollWidth - 50
              ) {
                container.scrollTo({ left: 0, behavior: "smooth" });
              } else {
                container.scrollBy({ left: scrollAmount, behavior: "smooth" });
              }
            }, 3500);
          }}
        >
          {featuredProducts.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 snap-start group" // Reduced width and effects
            >
              <div className="relative overflow-hidden rounded-t-xl h-48 bg-gray-100 flex items-center justify-center p-3"> {/* Reduced height and padding */}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="max-h-40 max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300" // Smaller image
                />
                <div className="absolute top-2 left-2"> {/* Adjusted position */}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"> {/* Smaller badge */}
                    {product.category}
                  </span>
                </div>
                <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"> {/* Smaller button */}
                  <svg
                    className="w-4 h-4 text-gray-600" // Smaller icon
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-4"> {/* Reduced padding */}
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2"> {/* Smaller text */}
                  {product.name}
                </h3>

                <div className="flex items-center mb-2"> {/* Reduced margin */}
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                    <span className="ml-1 text-xs text-gray-600"> {/* Smaller text */}
                      ({product.reviews.toLocaleString()})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-blue-600"> {/* Smaller price */}
                      ₹{product.price.toLocaleString()}
                    </p>
                  </div>
                  {/* Removed the Add to Cart button */}
                  <div className="w-8"></div> {/* Smaller spacer */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products from DB */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <CProductPage
          mainCategory={mainCategory}
          subCategory={subCategory}
          addToCart={addToCart}
        />
      </div>
      
      <Footer />

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default Home;