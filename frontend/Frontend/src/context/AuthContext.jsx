// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "../axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyUser = async () => {
    try {
      const res = await axios.get("/test");
      setUser(res.data.user || true);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clear cookies from frontend
  const clearCookie = (name) => {
    // Clear with different path and domain combinations to ensure removal
    const cookieOptions = [
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
    ];
    
    cookieOptions.forEach(option => {
      document.cookie = option;
    });
  };

  const logout = async () => {
    try {
      // First, call backend to clear cookie on server side
      await axios.post('/logout');
      
      // Then clear the user state
      setUser(null);
      
      // Finally, clear cookies from frontend as backup
      clearCookie('token');
      clearCookie('access_token'); // Add this if your cookie name is access_token
      clearCookie('authToken');
      clearCookie('refreshToken');
      
      return { success: true };
    } catch (error) {
      // Even if backend fails, clear local state and cookies
      setUser(null);
      
      // Force clear cookies from frontend
      clearCookie('token');
      clearCookie('access_token');
      clearCookie('authToken');
      clearCookie('refreshToken');
      
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Logout failed' 
      };
    }
  };

  useEffect(() => {
    verifyUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, verifyUser }}>
      {children}
    </AuthContext.Provider>
  );
};