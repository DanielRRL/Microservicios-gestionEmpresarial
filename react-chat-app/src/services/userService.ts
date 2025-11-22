/**
 * Servicio de Usuarios
 * Maneja operaciones relacionadas con información de usuarios
 */

import api from './api';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

class UserService {
  /**
   * Obtiene información de un usuario por su ID
   * GET /api/auth/users/:userId
   */
  async getUserById(userId: string): Promise<UserInfo> {
    try {
      console.log(`[Users] Obteniendo usuario ${userId}`);
      const response = await api.get<{ user: UserInfo }>(`/auth/users/${userId}`);
      return response.data.user;
    } catch (error: any) {
      console.error(`[Users] Error al obtener usuario:`, error.response?.data || error);
      throw error;
    }
  }

  /**
   * Obtiene información de múltiples usuarios
   * Cache local para evitar llamadas repetidas
   */
  private userCache: Map<string, UserInfo> = new Map();

  async getUsersInfo(userIds: string[]): Promise<Map<string, UserInfo>> {
    const result = new Map<string, UserInfo>();
    const idsToFetch: string[] = [];

    // Verificar caché primero
    for (const userId of userIds) {
      const cached = this.userCache.get(userId);
      if (cached) {
        result.set(userId, cached);
      } else {
        idsToFetch.push(userId);
      }
    }

    // Obtener usuarios no cacheados
    for (const userId of idsToFetch) {
      try {
        const userInfo = await this.getUserById(userId);
        this.userCache.set(userId, userInfo);
        result.set(userId, userInfo);
      } catch (error) {
        console.error(`Error al obtener usuario ${userId}:`, error);
      }
    }

    return result;
  }

  /**
   * Limpia el caché de usuarios
   */
  clearCache(): void {
    this.userCache.clear();
  }
}

export default new UserService();
