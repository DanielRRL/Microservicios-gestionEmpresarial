/**
 * App Component - Router Principal
 * 
 * Configuración del sistema de rutas:
 * - /login: Página de inicio de sesión (pública)
 * - /admin: Dashboard de administrador (requiere rol admin)
 * - /dashboard: Dashboard de usuario (requiere autenticación)
 * - /: Redirección automática según estado de autenticación
 * 
 * Flujo:
 * 1. Usuario no autenticado → /login
 * 2. Usuario autenticado (admin) → /admin
 * 3. Usuario autenticado (user) → /dashboard
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import ProjectMembers from './pages/ProjectMembers/ProjectMembers';
import AIView from './pages/AIView/AIView';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';
import './styles/globals.css';
import './App.css';

/**
 * Componente: RootRedirect
 * Redirige la ruta raíz (/) según el estado de autenticación
 */
const RootRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si está autenticado
    if (authService.isAuthenticated()) {
      // Redirigir según rol
      if (authService.isAdmin()) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      // No autenticado → login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return null; // No renderiza nada, solo redirige
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz - Redirige automáticamente */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Ruta pública - Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta protegida - Admin Dashboard (solo admin) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta protegida - User Dashboard (cualquier usuario autenticado) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta protegida - Project Detail (usuarios autenticados) */}
        <Route 
          path="/projects/:projectId" 
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta protegida - Project Members (solo admin) */}
        <Route 
          path="/projects/:projectId/members" 
          element={
            <ProtectedRoute requireAdmin>
              <ProjectMembers />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta protegida - AI Assistant (solo admin) */}
        <Route 
          path="/ai" 
          element={
            <ProtectedRoute requireAdmin>
              <AIView />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta no encontrada - Redirigir a raíz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;