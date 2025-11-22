import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { projectService } from '../services';

class ProjectController {
  async getAllProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const projects = await projectService.getAllProjects(userId);
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  async getProjectById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId!;

      const project = await projectService.getProjectById(projectId, userId);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const project = await projectService.createProject(userId, req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId!;

      const project = await projectService.updateProject(
        projectId,
        userId,
        req.body
      );

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = req.userId!;

      const deleted = await projectService.deleteProject(projectId, userId);

      if (!deleted) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
}

export const projectController = new ProjectController();
