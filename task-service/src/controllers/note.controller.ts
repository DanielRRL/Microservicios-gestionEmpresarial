import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { noteService } from '../services';

/**
 * Controlador de Notas
 * Maneja las peticiones HTTP relacionadas con notas
 * Delega la lógica de negocio al NoteService
 */
class NoteController {
  /**
   * GET /api/projects/:projectId/tasks/:taskId/notes
   * Obtiene todas las notas de una tarea
   */
  async getAllNotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      // Usuario de prueba para testing sin autenticación
      const userId = req.userId || 'test-user-mcp';

      const notes = await noteService.getAllNotes(projectId, taskId, userId);

      // Si notes es null, la tarea no existe o el usuario no tiene acceso
      if (notes === null) {
        res.status(404).json({ error: 'Task not found or access denied' });
        return;
      }

      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  /**
   * POST /api/projects/:projectId/tasks/:taskId/notes
   * Crea una nueva nota en una tarea
   */
  async createNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      // Usuario de prueba para testing sin autenticación
      const userId = req.userId || 'test-user-mcp';

      const note = await noteService.createNote(
        projectId,
        taskId,
        userId,
        req.body
      );

      // Si note es null, la tarea no existe o el usuario no tiene acceso
      if (!note) {
        res.status(404).json({ error: 'Task not found or access denied' });
        return;
      }

      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create note' });
    }
  }

  /**
   * PUT /api/projects/:projectId/tasks/:taskId/notes/:noteId
   * Actualiza una nota
   * Solo el creador puede editar su propia nota
   */
  async updateNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId, noteId } = req.params;
      const userId = req.userId!;

      const note = await noteService.updateNote(
        projectId,
        taskId,
        noteId,
        userId,
        req.body
      );

      if (!note) {
        res
          .status(404)
          .json({ error: 'Note not found or you do not have permission to edit it' });
        return;
      }

      res.status(200).json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update note' });
    }
  }

  /**
   * DELETE /api/projects/:projectId/tasks/:taskId/notes/:noteId
   * Elimina una nota permanentemente
   * Solo el creador puede eliminar su propia nota
   */
  async deleteNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId, noteId } = req.params;
      // Usuario de prueba para testing sin autenticación
      const userId = req.userId || 'test-user-mcp';

      const deleted = await noteService.deleteNote(
        projectId,
        taskId,
        noteId,
        userId
      );

      if (!deleted) {
        res
          .status(404)
          .json({ error: 'Note not found or you do not have permission to delete it' });
        return;
      }

      res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete note' });
    }
  }
}

export const noteController = new NoteController();
