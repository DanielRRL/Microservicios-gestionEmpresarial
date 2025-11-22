/**
 * Cliente Axios configurado para comunicarse con el API Gateway
 * 
 * Todas las peticiones pasan por:
 * React App → API Gateway (puerto 4000) → Auth/Task Services
 * 
 * Características:
 * - Agrega automáticamente el token JWT en cada petición
 * - Maneja errores 401 (token expirado) y redirige a login
 * - Intercepta respuestas para logging centralizado
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// URL del API Gateway (punto de entrada único)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

/**
 * Interceptor de peticiones
 * Agrega el token JWT automáticamente si existe
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log de petición (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas
 * Maneja errores comunes (401, 403, 500)
 */
api.interceptors.response.use(
  (response) => {
    // Log de respuesta exitosa (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Error 401: Token inválido o expirado
    if (error.response?.status === 401) {
      console.warn('[API] Token inválido o expirado. Cerrando sesión...');
      
      // Limpiar datos de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir a login solo si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Error 403: Sin permisos
    if (error.response?.status === 403) {
      console.error('[API] Acceso denegado. No tienes permisos.');
    }
    
    // Error 500: Error del servidor
    if (error.response?.status === 500) {
      console.error('[API] Error interno del servidor.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
