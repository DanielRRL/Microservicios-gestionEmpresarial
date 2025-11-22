/**
 * Servicio de Autenticación
 * 
 * Maneja todo lo relacionado con autenticación de usuarios:
 * - Login
 * - Logout
 * - Almacenamiento de tokens y datos de usuario
 * - Verificación de sesión activa
 * - Verificación de roles
 * 
 * Flujo de autenticación:
 * 1. Usuario envía credenciales
 * 2. API Gateway valida y redirige a Auth Service
 * 3. Auth Service valida y retorna JWT + datos de usuario
 * 4. Frontend guarda token y usuario en localStorage
 * 5. Interceptor de axios agrega token en cada petición
 */

import api from './api';

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  /**
   * Iniciar sesión
   * POST /api/auth/login (ruta pública)
   * 
   * @param credentials - Email y contraseña del usuario
   * @returns Token JWT y datos del usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      const { token, user } = response.data;
      
      // Guardar token y usuario en localStorage
      this.setToken(token);
      this.setUser(user);
      
      console.log(`[Auth] Login exitoso: ${user.name} (${user.role})`);
      
      return response.data;
    } catch (error: any) {
      console.error('[Auth] Error en login:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   * Limpia el token y datos del usuario del localStorage
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
    console.log('[Auth] Sesión cerrada');
  }

  /**
   * Obtener perfil del usuario actual
   * GET /api/auth/me (requiere JWT)
   * 
   * @returns Datos actualizados del usuario
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      
      // Actualizar datos del usuario en localStorage
      this.setUser(response.data.user);
      
      return response.data.user;
    } catch (error: any) {
      console.error('[Auth] Error al obtener perfil:', error.response?.data || error.message);
      throw error;
    }
  }

  // ============================================
  // Métodos de Token
  // ============================================

  /**
   * Obtener token JWT del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Guardar token JWT en localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Eliminar token JWT del localStorage
   */
  removeToken(): void {
    localStorage.removeItem('token');
  }

  // ============================================
  // Métodos de Usuario
  // ============================================

  /**
   * Obtener datos del usuario desde localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      return null;
    }
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('[Auth] Error al parsear usuario:', error);
      this.removeUser();
      return null;
    }
  }

  /**
   * Guardar datos del usuario en localStorage
   */
  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Eliminar datos del usuario del localStorage
   */
  removeUser(): void {
    localStorage.removeItem('user');
  }

  // ============================================
  // Métodos de Verificación
  // ============================================

  /**
   * Verificar si hay una sesión activa
   * (existe token en localStorage)
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Verificar si el usuario actual es administrador
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Verificar si el usuario actual es usuario normal
   */
  isUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'user';
  }
}

// Exportar instancia única (singleton)
export default new AuthService();
