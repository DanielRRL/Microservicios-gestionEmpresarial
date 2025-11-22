/**
 * Task Members Service
 * Cliente para gestionar usuarios asignados a tareas
 */

import api from './api';

export interface TaskMember {
  userId: string;
  addedAt: string;
  name?: string;
  email?: string;
}

class TaskMembersService {
  private static instance: TaskMembersService;

  private constructor() {}

  static getInstance(): TaskMembersService {
    if (!TaskMembersService.instance) {
      TaskMembersService.instance = new TaskMembersService();
    }
    return TaskMembersService.instance;
  }

  /**
   * Obtener usuarios asignados a una tarea
   */
  async getTaskMembers(projectId: string, taskId: string): Promise<TaskMember[]> {
    try {
      console.log(`[Task Members] Obteniendo miembros de tarea ${taskId}`);
      const response = await api.get<TaskMember[]>(
        `/projects/${projectId}/tasks/${taskId}/members`
      );
      console.log(`[Task Members] ${response.data.length} miembros cargados`);
      return response.data;
    } catch (error: any) {
      console.error('[Task Members] Error al cargar miembros:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Asignar usuario a tarea
   */
  async addMember(projectId: string, taskId: string, userId: string): Promise<void> {
    try {
      console.log(`[Task Members] Asignando usuario ${userId} a tarea ${taskId}`);
      await api.post(`/projects/${projectId}/tasks/${taskId}/members`, { userId });
      console.log('[Task Members] Usuario asignado exitosamente');
    } catch (error: any) {
      console.error('[Task Members] Error al asignar usuario:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Remover usuario de tarea
   */
  async removeMember(projectId: string, taskId: string, userId: string): Promise<void> {
    try {
      console.log(`[Task Members] Removiendo usuario ${userId} de tarea ${taskId}`);
      await api.delete(`/projects/${projectId}/tasks/${taskId}/members/${userId}`);
      console.log('[Task Members] Usuario removido exitosamente');
    } catch (error: any) {
      console.error('[Task Members] Error al remover usuario:', error.response?.data || error);
      throw error;
    }
  }
}

export default TaskMembersService.getInstance();
