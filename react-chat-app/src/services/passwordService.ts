/**
 * Password Service
 * Gestión de cambio de contraseña
 */

import api from './api';

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class PasswordService {
  private static instance: PasswordService;

  private constructor() {}

  static getInstance(): PasswordService {
    if (!PasswordService.instance) {
      PasswordService.instance = new PasswordService();
    }
    return PasswordService.instance;
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await api.put('/auth/change-password', data);
      console.log('[Password] Contraseña cambiada exitosamente');
    } catch (error: any) {
      console.error('[Password] Error:', error.response?.data || error);
      throw error;
    }
  }
}

export default PasswordService.getInstance();
