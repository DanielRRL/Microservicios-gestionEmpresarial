/**
 * Auth Service Client
 * 
 * Cliente HTTP para comunicarse con el microservicio de autenticación.
 * Obtiene información de usuarios desde el auth-service.
 */

import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:4001';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class AuthServiceClient {
  /**
   * Extraer token del header Authorization
   * Maneja formato "Bearer token" o solo "token"
   */
  private static extractToken(authHeader: string): string {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return authHeader;
  }

  /**
   * Obtener información de un usuario por ID
   * GET /api/auth/users/:userId
   */
  static async getUserById(userId: string, token: string): Promise<User | null> {
    try {
      const cleanToken = this.extractToken(token);
      const response = await axios.get<User>(`${AUTH_SERVICE_URL}/api/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching user ${userId}:`, error.message);
      throw new Error('Failed to fetch user from auth service');
    }
  }

  /**
   * Obtener todos los usuarios (solo admin)
   * GET /api/auth/users
   */
  static async getAllUsers(token: string): Promise<User[]> {
    try {
      const cleanToken = this.extractToken(token);
      const response = await axios.get<User[]>(`${AUTH_SERVICE_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all users:', error.message);
      throw new Error('Failed to fetch users from auth service');
    }
  }

  /**
   * Validar si un usuario existe
   */
  static async userExists(userId: string, token: string): Promise<boolean> {
    const user = await this.getUserById(userId, token);
    return user !== null;
  }
}
