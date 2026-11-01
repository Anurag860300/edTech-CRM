import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin as apiLoginAdmin, getAdminProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('edtech_crm_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify existing token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('edtech_crm_token');
      if (storedToken) {
        try {
          const profile = await getAdminProfile();
          if (profile.success && profile.admin) {
            setAdmin(profile.admin);
          } else {
            logout();
          }
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for 401 unauthorized token expiration events
    const handleTokenExpired = () => {
      setToken(null);
      setAdmin(null);
    };

    window.addEventListener('auth_token_expired', handleTokenExpired);
    return () => window.removeEventListener('auth_token_expired', handleTokenExpired);
  }, []);

  const login = async (email, password) => {
    const data = await apiLoginAdmin(email, password);
    if (data.success && data.token) {
      localStorage.setItem('edtech_crm_token', data.token);
      localStorage.setItem('edtech_crm_admin', JSON.stringify(data.admin));
      setToken(data.token);
      setAdmin(data.admin);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('edtech_crm_token');
    localStorage.removeItem('edtech_crm_admin');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
