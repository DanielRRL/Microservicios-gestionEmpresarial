/**
 * Project Members Service
 * 
 * Gestiona los miembros de un proyecto:
 * - Listar miembros con su información completa
 * - Agregar usuarios al proyecto
 * - Remover usuarios del proyecto
 */

import { Project } from '../models';
import { AuthServiceClient } from './auth.service';

interface ProjectMember {
  userId: string;
  role: 'owner' | 'member';
  addedAt: Date;
  name?: string;
  email?: string;
}

export class ProjectMembersService {
  /**
   * Obtener todos los miembros de un proyecto con su información
   */
  async getProjectMembers(projectId: string, requestUserId: string, token: string): Promise<ProjectMember[]> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findOne({
      _id: projectId,
      userId: requestUserId,
      isActive: true,
    });

    if (!project) {
      return [];
    }

    // Incluir al owner como miembro
    const members: ProjectMember[] = [
      {
        userId: project.userId,
        role: 'owner' as const,
        addedAt: project.createdAt,
      },
      ...(project.members || []).map(m => ({
        userId: m.userId,
        role: m.role,
        addedAt: m.addedAt,
      })),
    ];

    // Obtener información de usuarios desde auth-service
    const membersWithInfo = await Promise.all(
      members.map(async (member) => {
        try {
          const user = await AuthServiceClient.getUserById(member.userId, token);
          return {
            userId: member.userId,
            role: member.role,
            addedAt: member.addedAt,
            name: user?.name,
            email: user?.email,
          };
        } catch (error) {
          console.error(`Error fetching user ${member.userId}:`, error);
          return {
            userId: member.userId,
            role: member.role,
            addedAt: member.addedAt,
          };
        }
      })
    );

    return membersWithInfo;
  }

  /**
   * Agregar un miembro al proyecto
   */
  async addMember(projectId: string, userIdToAdd: string, requestUserId: string, token: string): Promise<boolean> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findOne({
      _id: projectId,
      userId: requestUserId,
      isActive: true,
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verificar que el usuario a agregar existe
    const userExists = await AuthServiceClient.userExists(userIdToAdd, token);
    if (!userExists) {
      throw new Error('User not found');
    }

    // Verificar que no es el owner
    if (userIdToAdd === project.userId) {
      throw new Error('Owner is already a member');
    }

    // Verificar que no está ya agregado
    const alreadyMember = project.members?.some((m) => m.userId === userIdToAdd);
    if (alreadyMember) {
      throw new Error('User is already a member');
    }

    // Agregar miembro
    await Project.updateOne(
      { _id: projectId },
      {
        $push: {
          members: {
            userId: userIdToAdd,
            role: 'member',
            addedAt: new Date(),
          },
        },
      }
    );

    return true;
  }

  /**
   * Remover un miembro del proyecto
   */
  async removeMember(projectId: string, userIdToRemove: string, requestUserId: string): Promise<boolean> {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await Project.findOne({
      _id: projectId,
      userId: requestUserId,
      isActive: true,
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // No se puede remover al owner
    if (userIdToRemove === project.userId) {
      throw new Error('Cannot remove project owner');
    }

    // Remover miembro
    const result = await Project.updateOne(
      { _id: projectId },
      {
        $pull: {
          members: { userId: userIdToRemove },
        },
      }
    );

    return result.modifiedCount > 0;
  }
}

export const projectMembersService = new ProjectMembersService();
