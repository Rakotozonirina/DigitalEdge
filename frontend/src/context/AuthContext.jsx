import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthConfig } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const refreshUser = async (tokenOverride) => {
    const token = tokenOverride || user?.token;

    if (!token) {
      return { success: false, message: 'Aucun token disponible' };
    }

    try {
      const { data } = await api.get('/auth/me', getAuthConfig(token));
      const nextUser = { ...data, token };
      setUser(nextUser);
      localStorage.setItem('userInfo', JSON.stringify(nextUser));
      return { success: true, user: nextUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Impossible de rafraichir le profil',
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
