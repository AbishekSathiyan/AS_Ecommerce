// src/Context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // Firebase user
  const [loading, setLoading] = useState(true);  // Loading state
  const [isAdmin, setIsAdmin] = useState(false); // Admin session

  const auth = getAuth();

  // Track Firebase auth user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Check admin token in localStorage (1 day expiry)
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const expiry = localStorage.getItem("adminTokenExpiry");

    if (token && expiry && new Date().getTime() < Number(expiry)) {
      setIsAdmin(true);
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminTokenExpiry");
      setIsAdmin(false);
    }
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminTokenExpiry");
    } catch (err) {
      console.error("Logout error:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, setIsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
