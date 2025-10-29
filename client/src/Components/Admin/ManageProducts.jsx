import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiX,
  FiUpload,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiImage,
  FiLink,
  FiSave,
  FiPackage,
  FiMinus,
} from "react-icons/fi";

// API Base URL - Use proxy for development to avoid CORS
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// API Endpoints
const API_ADD = `${API_BASE}/products/add`;
const API_GET = `${API_BASE}/products`;
const API_DELETE = `${API_BASE}/products/delete`;
const API_UPDATE = `${API_BASE}/products/update`;

// Categories
const categoryGroups = {
  Electronics: [
    "Laptops & Computers",
    "Mobiles & Tablets",
    "Audio Devices",
    "Wearables",
    "Cameras & Accessories",
    "Gaming Consoles & Accessories",
  ],
  Fashion: [
    "Men's Clothing",
    "Women's Clothing",
    "Kids' Wear",
    "Footwear",
    "Bags, Wallets & Belts",
    "Jewelry & Watches",
  ],
  "Home & Living": [
    "Furniture",
    "Kitchen & Dining",
    "Home Decor",
    "Bedding & Furnishings",
    "Storage & Organization",
  ],
};

function ManageProducts() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    mainCategory: "",
    subCategory: "",
    images: [],
    imageLinks: [],
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("add");
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);
  const linkInputRef = useRef(null);

  // Product management functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (type) => {
    setFormData((prev) => {
      const currentStock = parseInt(prev.stock) || 0;
      let newStock = currentStock;
      
      if (type === 'increment') {
        newStock = currentStock + 1;
      } else if (type === 'decrement' && currentStock > 0) {
        newStock = currentStock - 1;
      }
      
      return { ...prev, stock: newStock.toString() };
    });
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      Swal.fire("Invalid Files", "Please select only image files.", "warning");
      return;
    }

    const totalImages = formData.images.length + formData.imageLinks.length + existingImages.length;
    if (totalImages + validFiles.length > 5) {
      Swal.fire(
        "Image Limit Exceeded",
        "You can upload a maximum of 5 images per product.",
        "warning"
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    setImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleImagesChange = (e) => handleFiles(e.target.files);

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (index) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const addImageLink = () => {
    const url = linkInputRef.current.value.trim();
    if (!url) {
      Swal.fire("Empty URL", "Please enter a valid image URL.", "warning");
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Swal.fire("Invalid URL", "Please enter a valid HTTP or HTTPS URL.", "warning");
      return;
    }
    
    const totalImages = formData.images.length + formData.imageLinks.length + existingImages.length;
    if (totalImages >= 5) {
      Swal.fire(
        "Image Limit Exceeded",
        "You can upload a maximum of 5 images per product.",
        "warning"
      );
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      imageLinks: [...prev.imageLinks, url],
    }));
    linkInputRef.current.value = "";
  };

  const removeImageLink = (index) => {
    const newLinks = [...formData.imageLinks];
    newLinks.splice(index, 1);
    setFormData((prev) => ({ ...prev, imageLinks: newLinks }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      mainCategory: "",
      subCategory: "",
      images: [],
      imageLinks: [],
    });
    setImagePreviews([]);
    setExistingImages([]);
    setEditingProduct(null);
  };

  const setupEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock || "0",
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      images: [],
      imageLinks: [],
    });
    
    const productImages = extractImageUrls(product);
    setExistingImages(productImages);
    setImagePreviews([]);
  };

  const extractImageUrls = (product) => {
    if (!product) return [];
    
    if (product.allImages && Array.isArray(product.allImages)) {
      return product.allImages.map(img => 
        typeof img === 'object' ? (img.url || img.secure_url || '') : img
      ).filter(url => url);
    }
    
    if (product.images && Array.isArray(product.images)) {
      return product.images.map(img => 
        typeof img === 'object' ? (img.url || img.secure_url || '') : img
      ).filter(url => url);
    }
    
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      return product.imageUrls;
    }
    
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.mainCategory || !formData.subCategory) {
      Swal.fire(
        "Missing Information",
        "Please fill in all required fields: Name, Price, Main Category, and Sub Category.",
        "warning"
      );
      return;
    }

    if (!formData.mainCategory || !formData.subCategory) {
      Swal.fire(
        "Category Required",
        "Please select both main and sub category.",
        "warning"
      );
      return;
    }

    const totalImages = formData.images.length + formData.imageLinks.length + existingImages.length;
    
    if (!editingProduct && totalImages === 0) {
      Swal.fire(
        "Images Required",
        "Please add at least one product image or image URL for new products.",
        "warning"
      );
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock || "0");
    data.append("mainCategory", formData.mainCategory);
    data.append("subCategory", formData.subCategory);

    formData.images.forEach((img) => data.append("images", img));

    const allImageLinks = [...existingImages, ...formData.imageLinks];
    if (allImageLinks.length > 0) {
      data.append("existingImages", JSON.stringify(allImageLinks));
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await axios.put(`${API_UPDATE}/${editingProduct._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          title: "Product Updated Successfully!",
          text: `${formData.name} has been updated.`,
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      } else {
        await axios.post(API_ADD, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({
          title: "Product Added Successfully!",
          text: `${formData.name} has been added to your inventory.`,
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      }

      resetForm();
      fetchProducts();
      setActiveTab("view");
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage = error.response?.data?.message || 
        (editingProduct ? "Failed to update product." : "Failed to add product.");
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API_GET);
      
      let productsData = [];
      if (Array.isArray(res.data)) {
        productsData = res.data;
      } else if (res.data.products && Array.isArray(res.data.products)) {
        productsData = res.data.products;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        productsData = res.data.data;
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire(
        "Connection Error",
        "Failed to load products. Please check your backend connection.",
        "error"
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p._id === productId);
    const productName = product?.name || "This product";

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${productName}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(productId);
        await axios.delete(`${API_DELETE}/${productId}`);
        
        setProducts(products.filter((p) => p._id !== productId));
        
        Swal.fire({
          title: "Deleted Successfully!",
          text: `${productName} has been removed from your inventory.`,
          icon: "success",
          confirmButtonColor: "#10B981",
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire({
          title: "Delete Failed",
          text: error.response?.data?.message || "Failed to delete product. Please try again.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const renderProductImage = (product) => {
    const images = extractImageUrls(product);
    
    if (images.length > 0) {
      const firstImage = images[0];
      
      return (
        <img
          src={firstImage}
          alt={product.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
      );
    }
    
    return (
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
        <FiImage size={32} className="text-gray-400" />
      </div>
    );
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.mainCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (activeTab === "view" || activeTab === "add") {
      fetchProducts();
    }
    
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [activeTab]);

  return (
    
    <div className="min-h-screen bg-gray-50">
       <div className="header bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-center py-4 px-6 shadow-md">
  <div className="flex items-center space-x-3">
    {/* Logo from public folder */}
    <img
      src="/Logo.jpg"      // ✅ leading slash required
      alt="AS Ecommerce Logo"
      className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-sm"
    />
    <h1 className="text-xl md:text-2xl font-bold tracking-wide">
      AS <span className="text-yellow-400">Ecommerce</span> Admin
    </h1>
  </div>
</div>  
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">Manage your product inventory</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === "add"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("add");
                resetForm();
              }}
            >
              <FiPlus size={16} /> {editingProduct ? "Edit Product" : "Add Product"}
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === "view"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("view")}
            >
              <FiPackage size={16} /> View Products ({products.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "add" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
                </h2>
                
                {!editingProduct && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm font-medium">
                      <strong>Image Required:</strong> Please add at least one product image for new products.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Name & Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Stock & Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleStockChange('decrement')}
                          className="p-3 bg-gray-100 rounded-l-lg border border-r-0 hover:bg-gray-200"
                          disabled={parseInt(formData.stock) <= 0}
                        >
                          <FiMinus size={16} />
                        </button>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          min="0"
                          className="w-full p-3 border-y text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleStockChange('increment')}
                          className="p-3 bg-gray-100 rounded-r-lg border border-l-0 hover:bg-gray-200"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Current stock quantity available
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Main Category *
                      </label>
                      <select
                        name="mainCategory"
                        value={formData.mainCategory}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData((prev) => ({ ...prev, subCategory: "" }));
                        }}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Main Category</option>
                        {Object.keys(categoryGroups).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sub Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sub Category *
                      </label>
                      <select
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        required
                        disabled={!formData.mainCategory}
                      >
                        <option value="">Select Sub Category</option>
                        {formData.mainCategory &&
                          categoryGroups[formData.mainCategory].map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Enter detailed product description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Existing Images (for editing) */}
                  {existingImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Existing Product Images
                      </label>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {existingImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Existing ${idx}`}
                              className="w-28 h-28 rounded-lg object-cover border shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-28 h-28 bg-gray-100 flex items-center justify-center absolute top-0 left-0 hidden">
                              <FiImage size={20} className="text-gray-400" />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload New Images ({formData.images.length + formData.imageLinks.length + existingImages.length}/5)
                    </label>
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagesChange}
                        className="hidden"
                      />
                      <FiUpload className="mx-auto text-gray-400 text-3xl mb-3" />
                      <p className="text-gray-600 font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        PNG, JPG, JPEG files (Max 5 images)
                      </p>
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        ref={linkInputRef}
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addImageLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <FiLink size={16} /> Add URL
                      </button>
                    </div>
                    {formData.imageLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.imageLinks.map((link, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-100 px-3 py-2 rounded flex items-center gap-2 text-sm"
                          >
                            <span className="truncate max-w-xs">{link}</span>
                            <button
                              type="button"
                              onClick={() => removeImageLink(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Image Previews
                      </label>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${idx}`}
                              className="w-28 h-28 rounded-lg object-cover border shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 ${
                        isSubmitting
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {editingProduct ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          {editingProduct ? <FiSave size={16} /> : <FiPlus size={16} />}
                          {editingProduct ? "Update Product" : "Add Product"}
                        </>
                      )}
                    </button>
                    
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 rounded-lg font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* View Products */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Manage Products
                  </h2>
                  <div className="relative max-w-xs">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiSearch size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                      {searchTerm ? "No products found" : "No products available"}
                    </p>
                    <p className="text-gray-400 mt-1">
                      {searchTerm
                        ? "Try a different search term"
                        : "Add your first product to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1 relative">
                          {renderProductImage(product)}
                          
                          <div 
                            className="w-full h-40 bg-gray-100 flex items-center justify-center absolute top-0 left-0"
                            style={{ display: 'none' }}
                          >
                            <FiImage size={32} className="text-gray-400" />
                          </div>
                          
                          <div className="p-4 space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 h-10 overflow-hidden">
                              {product.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <p className="text-blue-600 font-bold text-lg">
                                ₹{product.price}
                              </p>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {product.mainCategory}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <FiPackage className="mr-1" size={14} />
                                <span>Stock: {product.stock || 0}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                product.stock > 10 
                                  ? "bg-green-100 text-green-800" 
                                  : product.stock > 0 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-red-100 text-red-800"
                              }`}>
                                {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex border-t divide-x">
                          <button
                            onClick={() => {
                              setupEditForm(product);
                              setActiveTab("add");
                            }}
                            className="flex-1 p-2 text-blue-500 font-semibold hover:bg-blue-50 transition-colors flex justify-center items-center gap-1"
                          >
                            <FiEdit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={deletingId === product._id}
                            className="flex-1 p-2 text-red-500 font-semibold hover:bg-red-50 transition-colors flex justify-center items-center gap-1 disabled:opacity-50"
                          >
                            {deletingId === product._id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <FiTrash2 size={16} /> Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageProducts;