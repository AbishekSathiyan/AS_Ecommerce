import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const MySwal = withReactContent(Swal);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [brandFilter, setBrandFilter] = useState("all");
  const [advancedSearch, setAdvancedSearch] = useState(false);

  // Context hooks
  const { cartItems, addToCart, isInCart, getTotalItems, getTotalPrice } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // SweetAlert Toast helper
  const showToast = (icon, title, position = "top-end") => {
    const Toast = MySwal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
      showClass: { popup: "animate__animated animate__zoomIn animate__faster" },
      hideClass: {
        popup: "animate__animated animate__zoomOut animate__faster",
      },
    });
    Toast.fire({ icon, title });
  };

  // Fetch products with better error handling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/products/`);
        
        // Handle different response structures
        let productsData = [];
        if (Array.isArray(res.data)) {
          productsData = res.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          productsData = res.data.products;
        } else if (res.data && Array.isArray(res.data.data)) {
          productsData = res.data.data;
        }
        
        // Process images for each product
        const processedProducts = productsData.map(product => ({
          ...product,
          // Ensure images is always an array
          images: Array.isArray(product.images) 
            ? product.images.map(img => 
                typeof img === 'string' 
                  ? img.startsWith('http') 
                    ? img 
                    : `${API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`
                  : img.url || '/no-image.png'
              )
            : product.image 
              ? [typeof product.image === 'string' 
                  ? product.image.startsWith('http')
                    ? product.image
                    : `${API_BASE_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
                  : '/no-image.png']
              : ['/no-image.png']
        }));
        
        setProducts(processedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
        await MySwal.fire({
          icon: "error",
          title: "Connection Error",
          text: "Unable to fetch products. Please check your connection.",
          confirmButtonColor: "#dc2626",
          background: "#fef3f2",
          showClass: { popup: "animate__animated animate__headShake" },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Memoized derived data
  const categories = useMemo(() => [
    "all",
    ...new Set(products.map((p) => p.mainCategory).filter(Boolean)),
  ], [products]);

  const brands = useMemo(() => [
    "all",
    ...new Set(products.map((p) => p.brand).filter(Boolean)),
  ], [products]);

  const priceRanges = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => p.price || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Enhanced filtering with multiple criteria
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = searchTerm === "" || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === "all" || product.mainCategory === filterCategory;
      
      const matchesPrice = (product.price || 0) >= priceRange[0] && 
                          (product.price || 0) <= priceRange[1];
      
      const matchesBrand = brandFilter === "all" || product.brand === brandFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "brand":
          aValue = a.brand || "";
          bValue = b.brand || "";
          break;
        case "category":
          aValue = a.mainCategory || "";
          bValue = b.mainCategory || "";
          break;
        case "name":
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, filterCategory, priceRange, brandFilter, sortBy, sortOrder]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchTerm(value);
        }, 300);
      };
    })(),
    []
  );

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setPriceRange([priceRanges.min, priceRanges.max]);
    setBrandFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  // Update price range when products load
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([priceRanges.min, priceRanges.max]);
    }
  }, [products.length, priceRanges.min, priceRanges.max]);

  // Safe image URL handler
  const getSafeImageUrl = (image, index = 0) => {
    if (!image) return '/no-image.png';
    
    if (Array.isArray(image)) {
      const img = image[index] || image[0];
      return typeof img === 'string' 
        ? img.startsWith('http') 
          ? img 
          : `${API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`
        : '/no-image.png';
    }
    
    return typeof image === 'string'
      ? image.startsWith('http')
        ? image
        : `${API_BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`
      : '/no-image.png';
  };

  // Modal handlers
  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeProductDetails = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "unset";
  };

  // Image navigation
  const nextImage = (e) => {
    if (e) e.stopPropagation();
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  // Add to cart with login check
  const handleAddToCart = async (product) => {
    if (!user) {
      const result = await MySwal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to be logged in to add products to the cart.",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
        background: "#fef3c7",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        navigate("/login");
      }
      return;
    }

    if (isInCart(product._id)) {
      await MySwal.fire({
        title: "⚠️ Already in Cart",
        html: `<p class="text-gray-700">${product.name} is already in your cart!</p>`,
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        background: "#fef3c7",
      });
      return;
    }

    addToCart(product, 1);
    await MySwal.fire({
      title: <span className="text-green-600">✓ Added to Cart</span>,
      html: `<div class="text-center">
        <p class="font-semibold text-gray-700">${product.name}</p>
        <p class="text-blue-600 font-bold">₹${product.price?.toLocaleString()}</p>
      </div>`,
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
      background: "#f8fafc",
    });
  };

  // Buy Now with login check
  const handleBuyNow = async (product) => {
    if (!user) {
      const result = await MySwal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to be logged in to purchase products.",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
        background: "#fef3c7",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        navigate("/login");
      }
      return;
    }

    // Add product to cart if not already there
    if (!isInCart(product._id)) {
      addToCart(product, 1);
    }

    // Show confirmation message and navigate to cart
    const result = await MySwal.fire({
      title: "Added to Cart!",
      html: `<div class="text-left space-y-3">
        <div class="flex items-center space-x-3">
          <img src="${getSafeImageUrl(product.images)}" alt="${
        product.name
      }" class="w-16 h-16 object-cover rounded-lg border-2 border-gray-200" />
          <div>
            <p class="font-semibold text-gray-800">${product.name}</p>
            <p class="text-green-600 font-bold text-lg">₹${product.price?.toLocaleString()}</p>
          </div>
        </div>
        <p class="text-sm text-gray-600">Product added to cart. Proceed to checkout?</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "Go to Cart",
      cancelButtonText: "Continue Shopping",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      showClass: { popup: "animate__animated animate__fadeInUp" },
      customClass: {
        confirmButton: "px-6 py-2 rounded-lg font-medium",
        cancelButton: "px-6 py-2 rounded-lg font-medium",
      },
    });

    if (result.isConfirmed) {
      closeProductDetails();
      navigate("/cart");
    } else {
      await MySwal.fire({
        title: "✓ Added to Cart",
        text: `${product.name} has been added to your cart.`,
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        background: "#f8fafc",
      });
    }
  };

  // Enhanced Search and Filter UI
  const renderSearchAndFilters = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Main Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products by name, description, or brand..."
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        
        <button
          onClick={() => setAdvancedSearch(!advancedSearch)}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center space-x-2"
        >
          <span>Advanced Filters</span>
          <svg className={`h-4 w-4 transition-transform ${advancedSearch ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Filters */}
      {advancedSearch && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === "all" ? "All Brands" : brand}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="brand">Brand</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Math.max(priceRanges.min, parseInt(e.target.value) || priceRanges.min), priceRange[1]])}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Min"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Math.min(priceRanges.max, parseInt(e.target.value) || priceRanges.max)])}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min={priceRanges.min}
                max={priceRanges.max}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹{priceRanges.min.toLocaleString()}</span>
                <span>₹{priceRanges.max.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters & Results */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm("")} className="ml-2 hover:text-blue-600">
                ×
              </button>
            </span>
          )}
          {filterCategory !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Category: {filterCategory}
              <button onClick={() => setFilterCategory("all")} className="ml-2 hover:text-green-600">
                ×
              </button>
            </span>
          )}
          {brandFilter !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Brand: {brandFilter}
              <button onClick={() => setBrandFilter("all")} className="ml-2 hover:text-purple-600">
                ×
              </button>
            </span>
          )}
          {(priceRange[0] > priceRanges.min || priceRange[1] < priceRanges.max) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Price: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              <button onClick={() => setPriceRange([priceRanges.min, priceRanges.max])} className="ml-2 hover:text-orange-600">
                ×
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {filteredProducts.length} of {products.length} products
          </span>
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );

  if (error && products.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md border border-gray-200">
          <div className="text-4xl mb-4 text-gray-400">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Unable to Load Products
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              Product Catalog
            </h1>
            <p className="text-gray-600 mt-1">
              Discover our premium collection
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Search and Filters */}
        {renderSearchAndFilters()}

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Products ({filteredProducts.length})
            </h2>

            {cartItems.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-600 font-medium">
                  Cart: {getTotalItems()} items
                </span>
                <span className="text-blue-800 font-bold">
                  ₹{getTotalPrice().toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4 text-gray-300">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"> {/* Increased to 5 columns and reduced gap */}
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => openProductDetails(product)}
                >
                  <div className="relative overflow-hidden bg-gray-100">
                    <img
                      src={getSafeImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/no-image.png';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm"> {/* Smaller badge */}
                      <span className="text-green-600 font-bold text-xs"> {/* Smaller text */}
                        ₹{product.price?.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Image count badge */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full"> {/* Smaller badge */}
                        {product.images.length} images
                      </div>
                    )}
                  </div>

                  <div className="p-3"> {/* Reduced padding */}
                    <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-tight text-sm"> {/* Smaller text */}
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-2"> {/* Reduced margin */}
                      <span className="text-xs text-gray-500 capitalize"> {/* Smaller text */}
                        {product.mainCategory}
                      </span>
                      {product.brand && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"> {/* Smaller badge */}
                          {product.brand}
                        </span>
                      )}
                    </div>

                    <div
                      className="flex space-x-1.5" /* Reduced space */
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition font-medium text-xs flex items-center justify-center space-x-1" /* Smaller buttons */
                      >
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-xs" /* Smaller buttons */
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Modal */}
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate__animated animate__fadeIn">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-hidden relative max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={closeProductDetails}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                &times;
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Images Section */}
                <div className="lg:w-1/2 bg-gray-100 flex items-center justify-center relative p-4">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <>
                      <img
                        src={getSafeImageUrl(selectedProduct.images, currentImageIndex)}
                        alt={selectedProduct.name}
                        className="w-full h-96 object-contain"
                        onError={(e) => {
                          e.target.src = '/no-image.png';
                        }}
                      />
                      
                      {/* Navigation Arrows */}
                      {selectedProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow hover:shadow-md transition-all"
                          >
                            ◀
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow hover:shadow-md transition-all"
                          >
                            ▶
                          </button>
                          
                          {/* Image counter */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {selectedProduct.images.length}
                          </div>
                          
                          {/* Thumbnail strip */}
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 px-4">
                            {selectedProduct.images.slice(0, 5).map((img, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(index);
                                }}
                                className={`w-10 h-10 border-2 rounded ${
                                  index === currentImageIndex 
                                    ? 'border-blue-500' 
                                    : 'border-transparent'
                                }`}
                              >
                                <img
                                  src={getSafeImageUrl([img])}
                                  alt={`${selectedProduct.name} ${index + 1}`}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = '/no-image.png';
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-6xl mb-2">📷</div>
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="lg:w-1/2 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-green-600 font-bold text-2xl">
                        ₹{selectedProduct.price?.toLocaleString()}
                      </span>
                      {selectedProduct.brand && (
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                          {selectedProduct.brand}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      <strong>Category:</strong> {selectedProduct.mainCategory}
                    </div>
                    {selectedProduct.subCategory && (
                      <div className="text-sm text-gray-500">
                        <strong>Sub-category:</strong> {selectedProduct.subCategory}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-medium text-sm"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(selectedProduct)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;