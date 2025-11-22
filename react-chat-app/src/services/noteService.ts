/**
 * Note Service
 * Cliente para gestionar notas de tareas
 */

import api from './api';

export interface Note {
  _id: string;
  content: string;
  createdBy: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  content: string;
}

class NoteService {
  private static instance: NoteService;

  private constructor() {}

  static getInstance(): NoteService {
    if (!NoteService.instance) {
      NoteService.instance = new NoteService();
    }
    return NoteService.instance;
  }

  /**
   * Obtener todas las notas de una tarea
   */
  async getNotes(projectId: string, taskId: string): Promise<Note[]> {
    try {
      console.log(`[Notes] Obteniendo notas de tarea ${taskId}`);
      const response = await api.get<Note[]>(
        `/projects/${projectId}/tasks/${taskId}/notes`
      );
      console.log(`[Notes] ${response.data.length} notas cargadas`);
      return response.data;
    } catch (error: any) {
      console.error('[Notes] Error al cargar notas:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Crear una nueva nota
   */
  async createNote(
    projectId: string,
    taskId: string,
    data: CreateNoteData
  ): Promise<Note> {
    try {
      console.log(`[Notes] Creando nota en tarea ${taskId}`);
      const response = await api.post<Note>(
        `/projects/${projectId}/tasks/${taskId}/notes`,
        data
      );
      console.log('[Notes] Nota creada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('[Notes] Error al crear nota:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Actualizar una nota (solo creador)
   */
  async updateNote(
    projectId: string,
    taskId: string,
    noteId: string,
    data: CreateNoteData
  ): Promise<Note> {
    try {
      console.log(`[Notes] Actualizando nota ${noteId}`);
      const response = await api.put<Note>(
        `/projects/${projectId}/tasks/${taskId}/notes/${noteId}`,
        data
      );
      console.log('[Notes] Nota actualizada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('[Notes] Error al actualizar nota:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Eliminar una nota (solo creador)
   */
  async deleteNote(projectId: string, taskId: string, noteId: string): Promise<void> {
    try {
      console.log(`[Notes] Eliminando nota ${noteId}`);
      await api.delete(`/projects/${projectId}/tasks/${taskId}/notes/${noteId}`);
      console.log('[Notes] Nota eliminada exitosamente');
    } catch (error: any) {
      console.error('[Notes] Error al eliminar nota:', error.response?.data || error);
      throw error;
    }
  }
}

export default NoteService.getInstance();
