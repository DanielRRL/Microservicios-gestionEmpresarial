/**
 * Task Members Controller
 * 
 * Maneja las peticiones HTTP relacionadas con usuarios asignados a tareas.
 */

import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { taskMembersService } from '../services/task-members.service';

class TaskMembersController {
  /**
   * GET /api/projects/:projectId/tasks/:taskId/members
   * Obtiene todos los usuarios asignados a una tarea
   */
  async getMembers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      const userId = req.userId!;
      const token = req.headers.authorization || '';

      const members = await taskMembersService.getTaskMembers(
        projectId,
        taskId,
        userId,
        token
      );

      if (members === null) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(200).json(members);
    } catch (error: any) {
      console.error('Error getting task members:', error);
      res.status(500).json({ error: 'Failed to fetch task members' });
    }
  }

  /**
   * POST /api/projects/:projectId/tasks/:taskId/members
   * Asigna un usuario a la tarea
   * Body: { userId: string }
   */
  async addMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId } = req.params;
      const { userId: userIdToAdd } = req.body;
      const requestUserId = req.userId!;
      const token = req.headers.authorization || '';

      if (!userIdToAdd) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      await taskMembersService.addMember(
        projectId,
        taskId,
        userIdToAdd,
        requestUserId,
        token
      );

      res.status(200).json({ message: 'User assigned to task successfully' });
    } catch (error: any) {
      console.error('Error adding member to task:', error);

      if (error.message === 'Project not found' || error.message === 'Task not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      if (
        error.message === 'User is not a member of the project' ||
        error.message === 'User is already assigned to this task'
      ) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to assign user to task' });
    }
  }

  /**
   * DELETE /api/projects/:projectId/tasks/:taskId/members/:userId
   * Remueve un usuario de la tarea
   */
  async removeMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, taskId, userId: userIdToRemove } = req.params;
      const requestUserId = req.userId!;

      const removed = await taskMembersService.removeMember(
        projectId,
        taskId,
        userIdToRemove,
        requestUserId
      );

      if (!removed) {
        res.status(404).json({ error: 'User not assigned to this task' });
        return;
      }

      res.status(200).json({ message: 'User removed from task successfully' });
    } catch (error: any) {
      console.error('Error removing member from task:', error);

      if (error.message === 'Project not found' || error.message === 'Task not found') {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to remove user from task' });
    }
  }
}

export const taskMembersController = new TaskMembersController();
