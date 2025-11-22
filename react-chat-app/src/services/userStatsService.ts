/**
 * User Stats Service
 * Obtiene estadísticas del usuario (proyectos y tareas)
 */

import api from './api';
import authService from './authService';

export interface UserStats {
  projectsCount: number;
  tasksCount: number;
  projects: Array<{
    _id: string;
    name: string;
    role: 'owner' | 'member';
  }>;
}

class UserStatsService {
  private static instance: UserStatsService;

  private constructor() {}

  static getInstance(): UserStatsService {
    if (!UserStatsService.instance) {
      UserStatsService.instance = new UserStatsService();
    }
    return UserStatsService.instance;
  }

  /**
   * Obtener estadísticas del usuario autenticado
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const currentUser = authService.getCurrentUser();
      
      // Obtener proyectos
      const projectsResponse = await api.get('/projects');
      const projects = projectsResponse.data;

      // Contar tareas de todos los proyectos
      let tasksCount = 0;
      for (const project of projects) {
        const tasksResponse = await api.get(`/projects/${project._id}/tasks`);
        tasksCount += tasksResponse.data.length;
      }

      // Mapear proyectos con rol
      const projectsWithRole = projects.map((p: any) => ({
        _id: p._id,
        name: p.name,
        role: p.userId === currentUser?.id ? 'owner' : 'member'
      }));

      return {
        projectsCount: projects.length,
        tasksCount,
        projects: projectsWithRole
      };
    } catch (error: any) {
      console.error('[User Stats] Error:', error.response?.data || error);
      throw error;
    }
  }
}

export default UserStatsService.getInstance();
