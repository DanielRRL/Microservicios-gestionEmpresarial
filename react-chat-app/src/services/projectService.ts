/**
 * Servicio de Proyectos
 * 
 * Maneja todas las operaciones CRUD de proyectos:
 * - Listar proyectos del usuario
 * - Crear proyecto (solo admin)
 * - Actualizar proyecto (solo admin)
 * - Eliminar proyecto (solo admin)
 */

import api from './api';

// Interfaces
export interface Project {
  _id: string;
  name: string;
  description: string;
  clientName: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  clientName: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  clientName?: string;
}

class ProjectService {
  /**
   * Obtener todos los proyectos del usuario autenticado
   * GET /api/projects
   * 
   * @returns Lista de proyectos
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/projects');
      console.log(`[Projects] ${response.data.length} proyectos cargados`);
      return response.data;
    } catch (error: any) {
      console.error('[Projects] Error al cargar proyectos:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtener un proyecto por ID
   * GET /api/projects/:id
   * 
   * @param projectId - ID del proyecto
   * @returns Proyecto encontrado
   */
  async getProjectById(projectId: string): Promise<Project> {
    try {
      const response = await api.get<Project>(`/projects/${projectId}`);
      console.log(`[Projects] Proyecto cargado: ${response.data.name}`);
      return response.data;
    } catch (error: any) {
      console.error('[Projects] Error al cargar proyecto:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Crear un nuevo proyecto
   * POST /api/projects (requiere rol admin)
   * 
   * @param data - Datos del proyecto a crear
   * @returns Proyecto creado
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', data);
      console.log(`[Projects] Proyecto creado: ${response.data.name}`);
      return response.data;
    } catch (error: any) {
      console.error('[Projects] Error al crear proyecto:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Actualizar un proyecto existente
   * PUT /api/projects/:id (requiere rol admin)
   * 
   * @param projectId - ID del proyecto
   * @param data - Datos a actualizar
   * @returns Proyecto actualizado
   */
  async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    try {
      const response = await api.put<Project>(`/projects/${projectId}`, data);
      console.log(`[Projects] Proyecto actualizado: ${response.data.name}`);
      return response.data;
    } catch (error: any) {
      console.error('[Projects] Error al actualizar proyecto:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Eliminar un proyecto (soft delete)
   * DELETE /api/projects/:id (requiere rol admin)
   * 
   * @param projectId - ID del proyecto
   * @returns Confirmación de eliminación
   */
  async deleteProject(projectId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/projects/${projectId}`);
      console.log(`[Projects] Proyecto eliminado: ${projectId}`);
      return response.data;
    } catch (error: any) {
      console.error('[Projects] Error al eliminar proyecto:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Exportar instancia única (singleton)
export default new ProjectService();
