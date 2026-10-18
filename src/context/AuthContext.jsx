import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('skillswap_token');
      if (savedToken) {
        try {
          const profile = await api.getMe();
          if (profile && profile.id) {
            setUser(profile);
            setToken(savedToken);
          } else {
            localStorage.removeItem('skillswap_token');
            setUser(null);
            setToken(null);
          }
        } catch {
          localStorage.removeItem('skillswap_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res && res.token && res.user) {
        localStorage.setItem('skillswap_token', res.token);
        localStorage.setItem('skillswap_last_account', JSON.stringify({
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
        }));
        setToken(res.token);
        setUser(res.user);
        toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
        return { success: true, user: res.user };
      }
      throw new Error(res.error || 'Login failed');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.register(formData);
      if (res && res.token && res.user) {
        localStorage.setItem('skillswap_token', res.token);
        localStorage.setItem('skillswap_last_account', JSON.stringify({
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
        }));
        setToken(res.token);
        setUser(res.user);
        toast.success(`Account created! Welcome to SkillSwap, ${res.user.name.split(' ')[0]}!`);
        return { success: true, user: res.user };
      }
      throw new Error(res.error || 'Registration failed');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
    toast.info('You have signed out of SkillSwap.');
    // Immediately redirect to /login
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
