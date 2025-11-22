import { Router } from 'express';
import { body, param } from 'express-validator';
import { projectController } from '../controllers';
import { authenticate, validateRequest } from '../middlewares';

const router = Router();

/**
 * Validaciones para crear un proyecto
 * - name: requerido, no puede estar vacío
 * - description: requerido, no puede estar vacío
 * - clientName: requerido, no puede estar vacío
 */
const createProjectValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
];

/**
 * Validaciones para actualizar un proyecto
 * Todos los campos son opcionales pero si se envían, no pueden estar vacíos
 */
const updateProjectValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('clientName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Client name cannot be empty'),
];

/**
 * Validación para el parámetro projectId
 * Verifica que sea un ObjectId válido de MongoDB
 */
const projectIdValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
];

/**
 * GET /api/projects
 * Obtiene todos los proyectos activos del usuario autenticado
 * Requiere autenticación Bearer Token
 */
router.get(
  '/',
  authenticate,
  projectController.getAllProjects.bind(projectController)
);

/**
 * GET /api/projects/:projectId
 * Obtiene un proyecto específico por su ID
 * Verifica que el proyecto pertenezca al usuario autenticado
 * Requiere autenticación Bearer Token
 */
router.get(
  '/:projectId',
  authenticate,
  projectIdValidation,
  validateRequest,
  projectController.getProjectById.bind(projectController)
);

/**
 * POST /api/projects
 * Crea un nuevo proyecto para el usuario autenticado
 * Requiere: name, description, clientName en el body
 * Requiere autenticación Bearer Token
 */
router.post(
  '/',
  authenticate,
  createProjectValidation,
  validateRequest,
  projectController.createProject.bind(projectController)
);

/**
 * PUT /api/projects/:projectId
 * Actualiza un proyecto existente
 * Campos opcionales: name, description, clientName
 * Solo puede actualizar proyectos propios
 * Requiere autenticación Bearer Token
 */
router.put(
  '/:projectId',
  authenticate,
  projectIdValidation,
  updateProjectValidation,
  validateRequest,
  projectController.updateProject.bind(projectController)
);

/**
 * DELETE /api/projects/:projectId
 * Elimina un proyecto (soft delete - marca isActive como false)
 * Solo puede eliminar proyectos propios
 * Requiere autenticación Bearer Token
 */
router.delete(
  '/:projectId',
  authenticate,
  projectIdValidation,
  validateRequest,
  projectController.deleteProject.bind(projectController)
);

export default router;
