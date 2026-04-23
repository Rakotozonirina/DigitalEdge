import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />; // Redirige les non-admins vers l'accueil
  }

  return children;
};

export default AdminRoute;
