import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { taskService } from '../services';

/**
 * Controlador de Tareas
 * Maneja las peticiones HTTP relacionadas con tareas
 * Delega la lógica de negocio al TaskService
 */
class TaskController {
  /**
   * GET /api/projects/:projectId/tasks
   * Obtiene todas las tareas de un proyecto
   */
  async getAllTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId!;

      const tasks = await taskService.getAllTasks(projectId, userId);

      // Si tasks es null, el proyecto no existe o no pertenece al usuario
      if (tasks === null) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  /**
   * GET /api/projects/:projectId/tasks/:taskId
   * Obtiene una tarea específica por su ID
   */
  async getTaskById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      const userId = req.userId!;

      const task = await taskService.getTaskById(projectId, taskId, userId);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  /**
   * POST /api/projects/:projectId/tasks
   * Crea una nueva tarea en un proyecto
   */
  async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId!;

      const task = await taskService.createTask(projectId, userId, req.body);

      // Si task es null, el proyecto no existe o no pertenece al usuario
      if (!task) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  /**
   * PUT /api/projects/:projectId/tasks/:taskId
   * Actualiza una tarea existente
   */
  async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      const userId = req.userId!;

      const task = await taskService.updateTask(
        projectId,
        taskId,
        userId,
        req.body
      );

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  /**
   * POST /api/projects/:projectId/tasks/:taskId/status
   * Actualiza el estado de una tarea y registra el cambio
   */
  async updateTaskStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      const userId = req.userId!;

      const task = await taskService.updateTaskStatus(
        projectId,
        taskId,
        userId,
        req.body
      );

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task status' });
    }
  }

  /**
   * DELETE /api/projects/:projectId/tasks/:taskId
   * Elimina una tarea permanentemente
   */
  async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      const userId = req.userId!;

      const deleted = await taskService.deleteTask(projectId, taskId, userId);

      if (!deleted) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}

export const taskController = new TaskController();
