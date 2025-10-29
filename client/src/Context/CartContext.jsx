// Context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (!user) return setCartItems([]);

    try {
      setIsLoading(true);
      const savedCart = localStorage.getItem(`cart_${user.uid}`);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const validCart = parsedCart.filter(item => item && item._id && item.quantity > 0);
        setCartItems(validCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (user && !isLoading) {
      try {
        localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    }
  }, [cartItems, user, isLoading]);

  // Add/update/remove functions
  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) return;
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity, price: product.price, name: product.name, images: product.images }
            : item
        );
      } else {
        return [...prev, { ...product, quantity, price: product.price || 0, name: product.name || "Unknown", images: product.images || [] }];
      }
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(item => item._id !== id));
  const incrementQuantity = (product) => addToCart(product, 1);
  const decrementQuantity = (product) =>
    setCartItems(prev =>
      prev
        .map(item => item._id === product._id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item)
        .filter(item => item.quantity > 0)
    );
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) return removeFromCart(productId);
    setCartItems(prev => prev.map(item => item._id === productId ? { ...item, quantity: newQuantity } : item));
  };
  const clearCart = () => setCartItems([]);
  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const isInCart = (productId) => cartItems.some(item => item._id === productId);
  const getItemQuantity = (productId) => cartItems.find(item => item._id === productId)?.quantity || 0;

  const mergeCarts = (newCartItems) => {
    setCartItems(prev => {
      const merged = [...prev];
      newCartItems.forEach(newItem => {
        const index = merged.findIndex(item => item._id === newItem._id);
        if (index >= 0) {
          merged[index] = { ...merged[index], quantity: merged[index].quantity + newItem.quantity };
        } else {
          merged.push(newItem);
        }
      });
      return merged;
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isInCart,
        getItemQuantity,
        mergeCarts
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart in multiple components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
