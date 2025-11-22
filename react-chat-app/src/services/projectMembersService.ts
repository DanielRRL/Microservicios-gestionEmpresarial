/**
 * Servicio de Miembros de Proyectos
 * 
 * Maneja todas las operaciones relacionadas con miembros de proyectos:
 * - Listar miembros de un proyecto
 * - Agregar miembro a un proyecto
 * - Remover miembro de un proyecto
 * - Listar todos los usuarios disponibles
 */

import api from './api';

// Interfaces
export interface ProjectMember {
  userId: string;
  role: 'owner' | 'member';
  addedAt: string;
  name?: string;
  email?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

class ProjectMembersService {
  /**
   * Obtener todos los miembros de un proyecto
   * GET /api/projects/:projectId/members
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      const response = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
      console.log(`[Members] ${response.data.length} miembros cargados`);
      return response.data;
    } catch (error: any) {
      console.error('[Members] Error al cargar miembros:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Agregar un miembro al proyecto
   * POST /api/projects/:projectId/members
   */
  async addMember(projectId: string, userId: string): Promise<void> {
    try {
      await api.post(`/projects/${projectId}/members`, { userId });
      console.log(`[Members] Usuario ${userId} agregado al proyecto`);
    } catch (error: any) {
      console.error('[Members] Error al agregar miembro:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Remover un miembro del proyecto
   * DELETE /api/projects/:projectId/members/:userId
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      console.log(`[Members] Usuario ${userId} removido del proyecto`);
    } catch (error: any) {
      console.error('[Members] Error al remover miembro:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios disponibles
   * GET /api/auth/users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/auth/users');
      console.log(`[Members] ${response.data.length} usuarios disponibles`);
      return response.data;
    } catch (error: any) {
      console.error('[Members] Error al cargar usuarios:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Exportar instancia única (singleton)
export default new ProjectMembersService();
