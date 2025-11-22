import { Project } from '../models';
import { ICreateProjectDTO, IUpdateProjectDTO } from '../types';

/**
 * Servicio de Proyectos
 * Contiene toda la lógica de negocio relacionada con proyectos
 * Interactúa directamente con la base de datos a través del modelo Project
 */
class ProjectService {
  /**
   * Obtiene todos los proyectos activos de un usuario
   * @param userId - ID del usuario autenticado
   * @returns Array de proyectos del usuario (como creador o miembro)
   */
  async getAllProjects(userId: string) {
    // Busca proyectos donde el usuario es creador O está en members
    const projects = await Project.find({
      isActive: true,
      $or: [
        { userId }, // Usuario es el creador
        { 'members.userId': userId } // Usuario está en la lista de miembros
      ]
    });
    return projects;
  }

  /**
   * Obtiene un proyecto específico por su ID
   * @param projectId - ID del proyecto a buscar
   * @param userId - ID del usuario autenticado (para verificar acceso)
   * @returns Proyecto encontrado o null
   */
  async getProjectById(projectId: string, userId: string) {
    // Busca el proyecto verificando que el usuario sea creador O miembro
    const project = await Project.findOne({
      _id: projectId,
      isActive: true,
      $or: [
        { userId }, // Usuario es el creador
        { 'members.userId': userId } // Usuario está en la lista de miembros
      ]
    });
    return project;
  }

  /**
   * Crea un nuevo proyecto
   * @param userId - ID del usuario que crea el proyecto
   * @param data - Datos del proyecto (name, description, clientName)
   * @returns Proyecto creado
   */
  async createProject(userId: string, data: ICreateProjectDTO) {
    // Crea el proyecto asociándolo al usuario y marcándolo como activo
    const project = await Project.create({
      ...data,
      userId,
      isActive: true,
    });
    return project;
  }

  /**
   * Actualiza un proyecto existente
   * @param projectId - ID del proyecto a actualizar
   * @param userId - ID del usuario (para verificar propiedad)
   * @param data - Datos a actualizar (campos opcionales)
   * @returns Proyecto actualizado o null si no se encuentra
   */
  async updateProject(
    projectId: string,
    userId: string,
    data: IUpdateProjectDTO
  ) {
    // Actualiza solo si el proyecto pertenece al usuario y está activo
    // new: true devuelve el documento actualizado
    // runValidators: true ejecuta las validaciones del schema
    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId, isActive: true },
      { $set: data },
      { new: true, runValidators: true }
    );
    return project;
  }

  /**
   * Elimina un proyecto completamente de la base de datos (hard delete)
   * BORRA PERMANENTEMENTE el proyecto de la BD
   * @param projectId - ID del proyecto a eliminar
   * @param userId - ID del usuario (para verificar propiedad)
   * @returns true si se eliminó correctamente, false si no se encontró
   */
  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    // BORRA COMPLETAMENTE el proyecto de la base de datos
    const result = await Project.findOneAndDelete({
      _id: projectId,
      userId,
      isActive: true
    });
    return result !== null;
  }
}

// Exporta una instancia única del servicio (Singleton pattern)
export const projectService = new ProjectService();
