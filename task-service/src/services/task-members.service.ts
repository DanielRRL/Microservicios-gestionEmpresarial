/**
 * Task Members Service
 * 
 * Gestiona los usuarios asignados a una tarea:
 * - Solo pueden asignarse usuarios que sean miembros del proyecto
 * - Listar usuarios asignados con su información completa
 * - Agregar/remover usuarios de la tarea
 */

import { Task, Project } from '../models';
import { AuthServiceClient } from './auth.service';

interface TaskMember {
  userId: string;
  addedAt: Date;
  name?: string;
  email?: string;
}

export class TaskMembersService {
  /**
   * Obtener todos los usuarios asignados a una tarea
   */
  async getTaskMembers(
    projectId: string,
    taskId: string,
    requestUserId: string,
    token: string
  ): Promise<TaskMember[] | null> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findOne({
      _id: projectId,
      userId: requestUserId,
      isActive: true,
    });

    if (!project) {
      return null;
    }

    // Verificar que la tarea existe y pertenece al proyecto
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });

    if (!task) {
      return null;
    }

    const assignedUsers = task.assignedUsers || [];

    // Obtener información de usuarios desde auth-service
    const membersWithInfo = await Promise.all(
      assignedUsers.map(async (member) => {
        try {
          const user = await AuthServiceClient.getUserById(member.userId, token);
          return {
            userId: member.userId,
            addedAt: member.addedAt,
            name: user?.name,
            email: user?.email,
          };
        } catch (error) {
          console.error(`Error fetching user ${member.userId}:`, error);
          return {
            userId: member.userId,
            addedAt: member.addedAt,
          };
        }
      })
    );

    return membersWithInfo;
  }

  /**
   * Verificar si un usuario es miembro del proyecto
   */
  private async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const project = await Project.findOne({ _id: projectId, isActive: true });
    
    if (!project) return false;

    // El owner siempre es miembro
    if (project.userId === userId) return true;

    // Verificar si está en el array de miembros
    const isMember = project.members?.some((m) => m.userId === userId);
    return isMember || false;
  }

  /**
   * Agregar un usuario a la tarea
   * Solo puede agregar usuarios que sean miembros del proyecto
   */
  async addMember(
    projectId: string,
    taskId: string,
    userIdToAdd: string,
    requestUserId: string,
    token: string
  ): Promise<boolean> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findOne({
      _id: projectId,
      userId: requestUserId,
      isActive: true,
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verificar que la tarea existe y pertenece al proyecto
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Verificar que el usuario a agregar es miembro del proyecto
    const isProjectMember = await this.isProjectMember(projectId, userIdToAdd);
    if (!isProjectMember) {
      throw new Error('User is not a member of the project');
    }

    // Verificar que el usuario existe
    const userExists = await AuthServiceClient.userExists(userIdToAdd, token);
    if (!userExists) {
      throw new Error('User not found');
    }

    // Verificar que no está ya asignado
    const alreadyAssigned = task.assignedUsers?.some((m) => m.userId === userIdToAdd);
    if (alreadyAssigned) {
      throw new Error('User is already assigned to this task');
    }

    // Agregar usuario a la tarea
    await Task.updateOne(
      { _id: taskId },
      {
        $push: {
          assignedUsers: {
            userId: userIdToAdd,
            addedAt: new Date(),
          },
        },
      }
    );

    return true;
  }

  /**
   * Remover un usuario de la tarea
   */
  async removeMember(
    projectId: string,
    taskId: string,
    userIdToRemove: string,
    requestUserId: string
  ): Promise<boolean> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findOne({
      _id: projectId,
      userId: requestUserId,
      isActive: true,
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verificar que la tarea existe y pertenece al proyecto
    const task = await Task.findOne({
      _id: taskId,
      projectId,
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Remover usuario de la tarea
    const result = await Task.updateOne(
      { _id: taskId },
      {
        $pull: {
          assignedUsers: { userId: userIdToRemove },
        },
      }
    );

    return result.modifiedCount > 0;
  }
}

export const taskMembersService = new TaskMembersService();
