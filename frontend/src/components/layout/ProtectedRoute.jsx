// Archivo: src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();

  // Si no hay usuario, lo mandamos al login inmediatamente
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderizamos la ruta solicitada (el MainLayout)
  return <Outlet />;
}