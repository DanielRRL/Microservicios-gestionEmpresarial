import { Router } from 'express';
import { body, param } from 'express-validator';
import { noteController } from '../controllers';
import { authenticate, validateRequest } from '../middlewares';

const router = Router({ mergeParams: true }); // mergeParams permite acceder a :projectId y :taskId

/**
 * Validación para crear una nota
 * - content: requerido, no puede estar vacío
 */
const createNoteValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
];

/**
 * Validación para los parámetros de ruta
 * Verifica que projectId, taskId y noteId sean ObjectIds válidos de MongoDB
 */
const projectIdValidation = [
  param('projectId').isMongoId().withMessage('Invalid project ID'),
];

const taskIdValidation = [
  param('taskId').isMongoId().withMessage('Invalid task ID'),
];

const noteIdValidation = [
  param('noteId').isMongoId().withMessage('Invalid note ID'),
];

/**
 * GET /api/projects/:projectId/tasks/:taskId/notes
 * Obtiene todas las notas de una tarea específica
 * Las notas se ordenan por fecha de creación (más reciente primero)
 * Requiere autenticación Bearer Token
 */
router.get(
  '/',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  validateRequest,
  noteController.getAllNotes.bind(noteController)
);

/**
 * POST /api/projects/:projectId/tasks/:taskId/notes
 * Crea una nueva nota en la tarea especificada
 * Requiere: content en el body
 * El createdBy se extrae automáticamente del token de autenticación
 * Requiere autenticación Bearer Token
 */
router.post(
  '/',
  authenticate,
  [...projectIdValidation, ...taskIdValidation],
  createNoteValidation,
  validateRequest,
  noteController.createNote.bind(noteController)
);

/**
 * PUT /api/projects/:projectId/tasks/:taskId/notes/:noteId
 * Actualiza el contenido de una nota
 * Solo el creador de la nota puede editarla
 * Requiere autenticación Bearer Token
 */
router.put(
  '/:noteId',
  authenticate,
  [...projectIdValidation, ...taskIdValidation, ...noteIdValidation],
  createNoteValidation,
  validateRequest,
  noteController.updateNote.bind(noteController)
);

/**
 * DELETE /api/projects/:projectId/tasks/:taskId/notes/:noteId
 * Elimina una nota permanentemente (hard delete)
 * Solo el creador de la nota puede eliminarla
 * Requiere autenticación Bearer Token
 */
router.delete(
  '/:noteId',
  authenticate,
  [...projectIdValidation, ...taskIdValidation, ...noteIdValidation],
  validateRequest,
  noteController.deleteNote.bind(noteController)
);

export default router;
