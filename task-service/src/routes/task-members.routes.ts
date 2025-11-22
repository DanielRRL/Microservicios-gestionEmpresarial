import { Router } from 'express';
import { body, param } from 'express-validator';
import { taskMembersController } from '../controllers/task-members.controller';
import { authenticate, validateRequest } from '../middlewares';

const router = Router({ mergeParams: true });

/**
 * Validaciones
 */
const projectIdValidation = [param('projectId').isMongoId().withMessage('Invalid project ID')];
const taskIdValidation = [param('taskId').isMongoId().withMessage('Invalid task ID')];
const userIdValidation = [param('userId').notEmpty().withMessage('Invalid user ID')];
const addMemberValidation = [body('userId').notEmpty().withMessage('userId is required')];

/**
 * GET /api/projects/:projectId/tasks/:taskId/members
 * Lista usuarios asignados a la tarea
 */
router.get(
  '/',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  validateRequest,
  taskMembersController.getMembers.bind(taskMembersController)
);

/**
 * POST /api/projects/:projectId/tasks/:taskId/members
 * Asigna un usuario a la tarea (solo miembros del proyecto)
 */
router.post(
  '/',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  addMemberValidation,
  validateRequest,
  taskMembersController.addMember.bind(taskMembersController)
);

/**
 * DELETE /api/projects/:projectId/tasks/:taskId/members/:userId
 * Remueve un usuario de la tarea
 */
router.delete(
  '/:userId',
  authenticate,
  [...projectIdValidation, ...taskIdValidation, ...userIdValidation],
  validateRequest,
  taskMembersController.removeMember.bind(taskMembersController)
);

export default router;
