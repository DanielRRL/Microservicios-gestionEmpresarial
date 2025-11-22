import { Task } from '../models';
import { Project } from '../models';
import { ICreateTaskDTO, IUpdateTaskDTO, IUpdateTaskStatusDTO } from '../types';

/**
 * Servicio de Tareas
 * Contiene toda la lógica de negocio relacionada con tareas
 * Interactúa directamente con la base de datos a través del modelo Task
 */
class TaskService {
  /**
   * Verifica que un proyecto exista y el usuario tenga acceso
   * @param projectId - ID del proyecto a verificar
   * @param userId - ID del usuario autenticado
   * @returns true si el proyecto existe y el usuario es creador O miembro, false en caso contrario
   */
  private async verifyProjectOwnership(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    const project = await Project.findOne({
      _id: projectId,
      isActive: true,
      $or: [
        { userId }, // Usuario es el creador
        { 'members.userId': userId } // Usuario está en la lista de miembros
      ]
    });
    return project !== null;
  }

  /**
   * Obtiene todas las tareas de un proyecto específico
   * Verifica que el usuario sea dueño del proyecto
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario autenticado
   * @returns Array de tareas del proyecto o null si el proyecto no existe/no pertenece al usuario
   */
  async getAllTasks(projectId: string, userId: string) {
    // Verifica que el proyecto pertenezca al usuario
    const hasAccess = await this.verifyProjectOwnership(projectId, userId);
    if (!hasAccess) return null;

    // Obtiene todas las tareas del proyecto
    const tasks = await Task.find({ projectId });
    return tasks;
  }

  /**
   * Obtiene una tarea específica por su ID
   * Verifica que el usuario sea dueño del proyecto al que pertenece la tarea
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea a buscar
   * @param userId - ID del usuario autenticado
   * @returns Tarea encontrada o null
   */
  async getTaskById(projectId: string, taskId: string, userId: string) {
    // Verifica que el proyecto pertenezca al usuario
    const hasAccess = await this.verifyProjectOwnership(projectId, userId);
    if (!hasAccess) return null;

    // Busca la tarea que pertenezca al proyecto
    const task = await Task.findOne({ _id: taskId, projectId });
    return task;
  }

  /**
   * Crea una nueva tarea dentro de un proyecto
   * @param projectId - ID del proyecto donde se creará la tarea
   * @param userId - ID del usuario autenticado
   * @param data - Datos de la tarea (name, description)
   * @returns Tarea creada o null si el proyecto no existe/no pertenece al usuario
   */
  async createTask(projectId: string, userId: string, data: ICreateTaskDTO) {
    // Verifica que el proyecto pertenezca al usuario
    const hasAccess = await this.verifyProjectOwnership(projectId, userId);
    if (!hasAccess) return null;

    // Crea la tarea asociada al proyecto con estado 'pending' por defecto
    const task = await Task.create({
      ...data,
      projectId,
      status: 'pending',
      completedBy: [],
    });
    return task;
  }

  /**
   * Actualiza una tarea existente
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea a actualizar
   * @param userId - ID del usuario autenticado
   * @param data - Datos a actualizar (campos opcionales)
   * @returns Tarea actualizada o null si no se encuentra o no hay acceso
   */
  async updateTask(
    projectId: string,
    taskId: string,
    userId: string,
    data: IUpdateTaskDTO
  ) {
    // Verifica que el proyecto pertenezca al usuario
    const hasAccess = await this.verifyProjectOwnership(projectId, userId);
    if (!hasAccess) return null;

    // Actualiza la tarea
    // new: true devuelve el documento actualizado
    // runValidators: true ejecuta las validaciones del schema
    const task = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      { $set: data },
      { new: true, runValidators: true }
    );
    return task;
  }

  /**
   * Actualiza el estado de una tarea y registra el cambio en completedBy
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @param userId - ID del usuario que actualiza el estado
   * @param data - Nuevo estado de la tarea
   * @returns Tarea actualizada o null si no se encuentra o no hay acceso
   */
  async updateTaskStatus(
    projectId: string,
    taskId: string,
    userId: string,
    data: IUpdateTaskStatusDTO
  ) {
    // Verifica que el proyecto pertenezca al usuario
    const hasAccess = await this.verifyProjectOwnership(projectId, userId);
    if (!hasAccess) return null;

    // Actualiza el estado y agrega un registro al historial de completedBy
    const task = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      {
        $set: { status: data.status },
        $push: {
          completedBy: {
            userId,
            status: data.status,
          },
        },
      },
      { new: true, runValidators: true }
    );
    return task;
  }

  /**
   * Elimina una tarea permanentemente de la base de datos
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea a eliminar
   * @param userId - ID del usuario autenticado
   * @returns true si se eliminó correctamente, false si no se encontró o no hay acceso
   */
  async deleteTask(
    projectId: string,
    taskId: string,
    userId: string
  ): Promise<boolean> {
    // Verifica que el proyecto pertenezca al usuario
    const hasAccess = await this.verifyProjectOwnership(projectId, userId);
    if (!hasAccess) return false;

    // Elimina la tarea permanentemente
    const result = await Task.findOneAndDelete({ _id: taskId, projectId });
    return result !== null;
  }
}

// Exporta una instancia única del servicio (Singleton pattern)
export const taskService = new TaskService();
