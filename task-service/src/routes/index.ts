import { Router } from 'express';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import noteRoutes from './note.routes';
import projectMembersRoutes from './project-members.routes';
import taskMembersRoutes from './task-members.routes';

const router = Router();

// Rutas de proyectos
router.use('/projects', projectRoutes);

// Rutas de miembros de proyectos
router.use('/projects/:projectId/members', projectMembersRoutes);

// Rutas de tareas (anidadas bajo proyectos)
router.use('/projects/:projectId/tasks', taskRoutes);

// Rutas de miembros de tareas
router.use('/projects/:projectId/tasks/:taskId/members', taskMembersRoutes);

// Rutas de notas (anidadas bajo proyectos y tareas)
router.use('/projects/:projectId/tasks/:taskId/notes', noteRoutes);

export default router;
