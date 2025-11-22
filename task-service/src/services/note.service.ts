import { Note, Task, Project } from '../models';
import { ICreateNoteDTO } from '../types';

/**
 * Servicio de Notas
 * Contiene toda la lógica de negocio relacionada con notas
 * Interactúa directamente con la base de datos a través del modelo Note
 */
class NoteService {
  /**
   * Verifica que una tarea exista, pertenezca a un proyecto y el usuario tenga acceso
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea a verificar
   * @param userId - ID del usuario autenticado
   * @returns true si la tarea existe y el usuario tiene acceso (dueño o miembro), false en caso contrario
   */
  private async verifyTaskAccess(
    projectId: string,
    taskId: string,
    userId: string
  ): Promise<boolean> {
    // Verifica que el proyecto exista y el usuario sea dueño o miembro
    const project = await Project.findOne({
      _id: projectId,
      isActive: true,
      $or: [
        { userId },
        { 'members.userId': userId }
      ]
    });

    if (!project) return false;

    // Luego verifica que la tarea pertenezca al proyecto
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });

    return task !== null;
  }

  /**
   * Obtiene todas las notas de una tarea específica
   * Verifica que el usuario tenga acceso a la tarea
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @param userId - ID del usuario autenticado
   * @returns Array de notas de la tarea o null si no hay acceso
   */
  async getAllNotes(projectId: string, taskId: string, userId: string) {
    // Verifica que el usuario tenga acceso a la tarea
    const hasAccess = await this.verifyTaskAccess(projectId, taskId, userId);
    if (!hasAccess) return null;

    // Obtiene todas las notas de la tarea, ordenadas por fecha de creación (más reciente primero)
    const notes = await Note.find({ taskId }).sort({ createdAt: -1 });
    return notes;
  }

  /**
   * Crea una nueva nota en una tarea
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea donde se creará la nota
   * @param userId - ID del usuario que crea la nota
   * @param data - Datos de la nota (content)
   * @returns Nota creada o null si no hay acceso
   */
  async createNote(
    projectId: string,
    taskId: string,
    userId: string,
    data: ICreateNoteDTO
  ) {
    // Verifica que el usuario tenga acceso a la tarea
    const hasAccess = await this.verifyTaskAccess(projectId, taskId, userId);
    if (!hasAccess) return null;

    // Crea la nota asociada a la tarea y al usuario
    const note = await Note.create({
      content: data.content,
      taskId,
      createdBy: userId,
    });
    return note;
  }

  /**
   * Actualiza el contenido de una nota
   * Solo el creador de la nota puede editarla
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @param noteId - ID de la nota a actualizar
   * @param userId - ID del usuario autenticado
   * @param data - Nuevos datos de la nota (content)
   * @returns Nota actualizada o null si no se encontró o no tiene permisos
   */
  async updateNote(
    projectId: string,
    taskId: string,
    noteId: string,
    userId: string,
    data: ICreateNoteDTO
  ) {
    // Verifica que el usuario tenga acceso a la tarea
    const hasAccess = await this.verifyTaskAccess(projectId, taskId, userId);
    if (!hasAccess) return null;

    // Actualiza la nota solo si fue creada por el usuario autenticado
    const note = await Note.findOneAndUpdate(
      {
        _id: noteId,
        taskId,
        createdBy: userId,
      },
      { content: data.content },
      { new: true }
    );

    return note;
  }

  /**
   * Elimina una nota permanentemente de la base de datos
   * Solo el creador de la nota puede eliminarla
   * @param projectId - ID del proyecto
   * @param taskId - ID de la tarea
   * @param noteId - ID de la nota a eliminar
   * @param userId - ID del usuario autenticado
   * @returns true si se eliminó correctamente, false si no se encontró o no tiene permisos
   */
  async deleteNote(
    projectId: string,
    taskId: string,
    noteId: string,
    userId: string
  ): Promise<boolean> {
    // Verifica que el usuario tenga acceso a la tarea
    const hasAccess = await this.verifyTaskAccess(projectId, taskId, userId);
    if (!hasAccess) return false;

    // Elimina la nota solo si fue creada por el usuario autenticado
    // Esto asegura que un usuario solo puede eliminar sus propias notas
    const result = await Note.findOneAndDelete({
      _id: noteId,
      taskId,
      createdBy: userId,
    });

    return result !== null;
  }
}

// Exporta una instancia única del servicio (Singleton pattern)
export const noteService = new NoteService();
