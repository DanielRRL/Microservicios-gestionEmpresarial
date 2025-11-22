import { Router } from 'express';
import { body, param } from 'express-validator';
import { taskController } from '../controllers';
import { authenticate, validateRequest } from '../middlewares';

const router = Router({ mergeParams: true }); // mergeParams permite acceder a :projectId

/**
 * Validaciones para crear una tarea
 * - name: requerido, no puede estar vacío
 * - description: requerido, no puede estar vacío
 */
const createTaskValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

/**
 * Validaciones para actualizar una tarea
 * Todos los campos son opcionales pero si se envían, no pueden estar vacíos
 * status debe ser uno de los valores permitidos
 */
const updateTaskValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('status')
    .optional()
    .isIn(['pending', 'onHold', 'inProgress', 'underReview', 'completed'])
    .withMessage(
      'Status must be one of: pending, onHold, inProgress, underReview, completed'
    ),
];

/**
 * Validación para actualizar solo el estado de una tarea
 * status es requerido y debe ser uno de los valores permitidos
 */
const updateTaskStatusValidation = [
  body('status')
    .isIn(['pending', 'onHold', 'inProgress', 'underReview', 'completed'])
    .withMessage(
      'Status must be one of: pending, onHold, inProgress, underReview, completed'
    ),
];

/**
 * Validación para los parámetros de ruta
 * Verifica que projectId y taskId sean ObjectIds válidos de MongoDB
 */
const projectIdValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
];

const taskIdValidation = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
];

/**
 * GET /api/projects/:projectId/tasks
 * Obtiene todas las tareas de un proyecto específico
 * Requiere autenticación Bearer Token
 */
router.get(
  '/',
  authenticate,
  projectIdValidation,
  validateRequest,
  taskController.getAllTasks.bind(taskController)
);

/**
 * GET /api/projects/:projectId/tasks/:taskId
 * Obtiene una tarea específica por su ID
 * Verifica que la tarea pertenezca al proyecto
 * Requiere autenticación Bearer Token
 */
router.get(
  '/:taskId',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  validateRequest,
  taskController.getTaskById.bind(taskController)
);

/**
 * POST /api/projects/:projectId/tasks
 * Crea una nueva tarea en el proyecto especificado
 * Requiere: name, description en el body
 * Requiere autenticación Bearer Token
 */
router.post(
  '/',
  authenticate,
  projectIdValidation,
  createTaskValidation,
  validateRequest,
  taskController.createTask.bind(taskController)
);

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 * Actualiza una tarea existente
 * Campos opcionales: name, description, status
 * Requiere autenticación Bearer Token
 */
router.put(
  '/:taskId',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  updateTaskValidation,
  validateRequest,
  taskController.updateTask.bind(taskController)
);

/**
 * POST /api/projects/:projectId/tasks/:taskId/status
 * Actualiza solo el estado de una tarea
 * Registra el cambio en el historial completedBy
 * Requiere: status en el body
 * Requiere autenticación Bearer Token
 */
router.post(
  '/:taskId/status',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  updateTaskStatusValidation,
  validateRequest,
  taskController.updateTaskStatus.bind(taskController)
);

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 * Elimina una tarea permanentemente (hard delete)
 * Requiere autenticación Bearer Token
 */
router.delete(
  '/:taskId',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  validateRequest,
  taskController.deleteTask.bind(taskController)
);

export default router;
