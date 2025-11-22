/**
 * Componente: ProtectedRoute
 * 
 * Protege rutas que requieren autenticación y/o roles específicos
 * 
 * Funcionalidades:
 * - Verificar si el usuario está autenticado
 * - Verificar roles (admin/user)
 * - Redirigir a login si no está autenticado
 * - Redirigir a dashboard si no tiene el rol requerido
 * 
 * Uso:
 * <ProtectedRoute>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requireAdmin>
 *   <AdminPanel />
 * </ProtectedRoute>
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean; // Si true, solo admins pueden acceder
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  // Verificar si está autenticado
  const isAuthenticated = authService.isAuthenticated();
  
  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    console.log('❌ Usuario no autenticado - Redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Si requiere rol admin, verificar
  if (requireAdmin) {
    const isAdmin = authService.isAdmin();
    
    if (!isAdmin) {
      console.log('❌ Usuario sin permisos de admin - Redirigiendo a /dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Usuario autenticado y con permisos correctos
  console.log('✅ Acceso permitido');
  return children;
};

export default ProtectedRoute;
