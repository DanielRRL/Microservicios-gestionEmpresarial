/**
 * Project Members Routes
 * 
 * Rutas para gestionar miembros de proyectos.
 * Todas requieren autenticación y ser owner del proyecto.
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { projectMembersController } from '../controllers/project-members.controller';
import { authenticate, validateRequest } from '../middlewares';

const router = Router({ mergeParams: true });

/**
 * Validaciones
 */
const projectIdValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
];

const addMemberValidation = [
  body('userId').trim().notEmpty().withMessage('userId is required'),
];

const userIdValidation = [
  param('userId').trim().notEmpty().withMessage('Invalid user ID'),
];

/**
 * GET /api/projects/:projectId/members
 * Obtiene todos los miembros del proyecto
 */
router.get(
  '/',
  authenticate,
  projectIdValidation,
  validateRequest,
  projectMembersController.getMembers.bind(projectMembersController)
);

/**
 * POST /api/projects/:projectId/members
 * Agrega un miembro al proyecto
 * Body: { userId: string }
 */
router.post(
  '/',
  authenticate,
  projectIdValidation,
  addMemberValidation,
  validateRequest,
  projectMembersController.addMember.bind(projectMembersController)
);

/**
 * DELETE /api/projects/:projectId/members/:userId
 * Remueve un miembro del proyecto
 */
router.delete(
  '/:userId',
  authenticate,
  [...projectIdValidation, ...userIdValidation],
  validateRequest,
  projectMembersController.removeMember.bind(projectMembersController)
);

export default router;
