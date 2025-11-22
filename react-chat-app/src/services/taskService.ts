/**
 * Servicio de Tareas
 * 
 * Maneja todas las operaciones CRUD de tareas dentro de proyectos:
 * - Listar tareas de un proyecto
 * - Crear tarea en un proyecto
 * - Actualizar tarea
 * - Cambiar estado de tarea
 * - Eliminar tarea
 */

import api from './api';

// Enums
export type TaskStatus = 'pending' | 'onHold' | 'inProgress' | 'underReview' | 'completed';

// Interfaces
export interface Task {
  _id: string;
  name: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  completedBy: Array<{
    userId: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  name: string;
  description: string;
}

export interface UpdateTaskData {
  name?: string;
  description?: string;
  status?: TaskStatus;
}

class TaskService {
  /**
   * Obtener todas las tareas de un proyecto
   * GET /api/projects/:projectId/tasks
   * 
   * @param projectId - ID del proyecto
   * @returns Lista de tareas del proyecto
   */
  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
      console.log(`[Tasks] ${response.data.length} tareas cargadas para proyecto ${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('[Tasks] Error al cargar tareas:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtener una tarea específica
   * GET /api/projects/:projectId/tasks/:taskId
   * 
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @returns Tarea encontrada
   */
  async getTaskById(projectId: string, taskId: string): Promise<Task> {
    try {
      const response = await api.get<Task>(`/projects/${projectId}/tasks/${taskId}`);
      console.log(`[Tasks] Tarea cargada: ${response.data.name}`);
      return response.data;
    } catch (error: any) {
      console.error('[Tasks] Error al cargar tarea:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Crear una nueva tarea en un proyecto
   * POST /api/projects/:projectId/tasks
   * 
   * @param projectId - ID del proyecto
   * @param data - Datos de la tarea a crear
   * @returns Tarea creada
   */
  async createTask(projectId: string, data: CreateTaskData): Promise<Task> {
    try {
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
      console.log(`[Tasks] Tarea creada: ${response.data.name}`);
      return response.data;
    } catch (error: any) {
      console.error('[Tasks] Error al crear tarea:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Actualizar una tarea existente
   * PUT /api/projects/:projectId/tasks/:taskId
   * 
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @param data - Datos a actualizar
   * @returns Tarea actualizada
   */
  async updateTask(projectId: string, taskId: string, data: UpdateTaskData): Promise<Task> {
    try {
      const response = await api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data);
      console.log(`[Tasks] Tarea actualizada: ${response.data.name}`);
      return response.data;
    } catch (error: any) {
      console.error('[Tasks] Error al actualizar tarea:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Cambiar el estado de una tarea (con historial)
   * POST /api/projects/:projectId/tasks/:taskId/status
   * 
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @param status - Nuevo estado
   * @returns Tarea actualizada
   */
  async updateTaskStatus(projectId: string, taskId: string, status: TaskStatus): Promise<Task> {
    try {
      const response = await api.post<Task>(`/projects/${projectId}/tasks/${taskId}/status`, { status });
      console.log(`[Tasks] Estado actualizado: ${response.data.status}`);
      return response.data;
    } catch (error: any) {
      console.error('[Tasks] Error al actualizar estado:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Eliminar una tarea
   * DELETE /api/projects/:projectId/tasks/:taskId
   * 
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @returns Confirmación de eliminación
   */
  async deleteTask(projectId: string, taskId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/projects/${projectId}/tasks/${taskId}`);
      console.log(`[Tasks] Tarea eliminada: ${taskId}`);
      return response.data;
    } catch (error: any) {
      console.error('[Tasks] Error al eliminar tarea:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Exportar instancia única (singleton)
export default new TaskService();
