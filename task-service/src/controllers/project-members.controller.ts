/**
 * Project Members Controller
 * 
 * Maneja las peticiones HTTP relacionadas con miembros de proyectos.
 */

import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { projectMembersService } from '../services/project-members.service';

class ProjectMembersController {
  /**
   * GET /api/projects/:projectId/members
   * Obtiene todos los miembros de un proyecto
   */
  async getMembers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId!;
      const token = req.headers.authorization || '';

      const members = await projectMembersService.getProjectMembers(projectId, userId, token);

      if (members.length === 0) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json(members);
    } catch (error: any) {
      console.error('Error getting members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  /**
   * POST /api/projects/:projectId/members
   * Agrega un miembro al proyecto
   * Body: { userId: string }
   */
  async addMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { userId: userIdToAdd } = req.body;
      const requestUserId = req.userId!;
      const token = req.headers.authorization || '';

      if (!userIdToAdd) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      await projectMembersService.addMember(projectId, userIdToAdd, requestUserId, token);

      res.status(200).json({ message: 'Member added successfully' });
    } catch (error: any) {
      console.error('Error adding member:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message === 'Owner is already a member' || error.message === 'User is already a member') {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to add member' });
    }
  }

  /**
   * DELETE /api/projects/:projectId/members/:userId
   * Remueve un miembro del proyecto
   */
  async removeMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId, userId: userIdToRemove } = req.params;
      const requestUserId = req.userId!;

      const removed = await projectMembersService.removeMember(projectId, userIdToRemove, requestUserId);

      if (!removed) {
        res.status(404).json({ error: 'Member not found' });
        return;
      }

      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error: any) {
      console.error('Error removing member:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message === 'Cannot remove project owner') {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: 'Failed to remove member' });
    }
  }
}

export const projectMembersController = new ProjectMembersController();
