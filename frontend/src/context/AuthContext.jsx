import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginAPI, registerAPI, getMeAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user details if token is present
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMeAPI();
          if (res.success) {
            setUser(res.data);
            setIsAuthenticated(true);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Failed to load user info:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const res = await loginAPI(credentials);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.data);
        setIsAuthenticated(true);
        return { success: true, user: res.data };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const res = await registerAPI(userData);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.data);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        setUser,
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
