import express, { Express, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { verifyToken, optionalAuth, AuthRequest } from '../middleware/auth';
import { requireAdmin, requireUser } from '../middleware/roles';

export function setupProxies(app: Express) {
  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
  const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:3000';

  // ========================================
  // AUTH SERVICE ROUTES
  // ========================================
  
  // Ruta pública - Solo login
  app.post('/api/auth/login', 
    createProxyMiddleware({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq: any, req: any, res: any) => {
          console.log(`[Public Auth] ${req.method} ${req.path}`);
        },
        error: handleProxyError
      }
    })
  );

  // Rutas protegidas de autenticación
  
  // POST /api/auth/register - Solo ADMIN puede crear usuarios
  app.post('/api/auth/register',
    verifyToken,
    requireAdmin,
    createProxyMiddleware({
      target: AUTH_SERVICE_URL,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq: any, req: AuthRequest, res: any) => {
          console.log(`[Admin Only] ${req.method} /api/auth/register - Admin: ${req.user?.id}`);
          
          // Headers de usuario
          if (req.user) {
            proxyReq.setHeader('X-User-Id', req.user.id);
            proxyReq.setHeader('X-User-Role', req.user.role);
          }
        },
        error: handleProxyError
      }
    })
  );

  // GET /api/auth/users - Solo ADMIN puede listar usuarios
  app.get('/api/auth/users', verifyToken, requireAdmin, createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq: any, req: AuthRequest) => {
        console.log(`[Admin Only] ${req.method} /api/auth/users - Admin: ${req.user?.id}`);
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
      },
      error: handleProxyError
    }
  }));

  // GET /api/auth/users/:userId - Cualquier usuario autenticado puede obtener info de un usuario
  app.get('/api/auth/users/:userId', verifyToken, requireUser, createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq: any, req: AuthRequest) => {
        console.log(`[Protected Auth] GET ${req.path} - User: ${req.user?.id}`);
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
        // Preservar Authorization header
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      error: handleProxyError
    }
  }));

  // Rutas protegidas de autenticación (requieren JWT)
  app.get('/api/auth/me', verifyToken, createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq: any, req: AuthRequest) => {
        console.log(`[Protected Auth] GET /api/auth/me - User: ${req.user?.id}`);
        // Pasar userId al microservicio
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
        // Preservar Authorization header
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      error: handleProxyError
    }
  }));

  app.put('/api/auth/change-password', verifyToken, createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq: any, req: AuthRequest) => {
        console.log(`[Protected Auth] PUT /api/auth/change-password - User: ${req.user?.id}`);
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
        // Preservar Authorization header
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      error: handleProxyError
    }
  }));

  // ========================================
  // TASK SERVICE ROUTES - PROJECTS
  // ========================================
  
  // GET /api/projects - Todos los usuarios autenticados pueden listar proyectos
  app.get('/api/projects', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // POST /api/projects - Solo ADMIN puede crear proyectos
  app.post('/api/projects', verifyToken, requireAdmin, proxyToTaskService('/api/projects'));
  
  // GET /api/projects/:id - Todos los usuarios autenticados pueden ver un proyecto
  app.get('/api/projects/:id', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // PUT /api/projects/:id - Solo ADMIN puede actualizar proyectos
  app.put('/api/projects/:id', verifyToken, requireAdmin, proxyToTaskService('/api/projects'));
  
  // DELETE /api/projects/:id - Solo ADMIN puede eliminar proyectos
  app.delete('/api/projects/:id', verifyToken, requireAdmin, proxyToTaskService('/api/projects'));

  // ========================================
  // TASK SERVICE ROUTES - PROJECT MEMBERS
  // ========================================
  
  // GET /api/projects/:projectId/members - Solo ADMIN puede listar miembros
  app.get('/api/projects/:projectId/members', verifyToken, requireAdmin, proxyToTaskService('/api/projects'));
  
  // POST /api/projects/:projectId/members - Solo ADMIN puede agregar miembros
  app.post('/api/projects/:projectId/members', verifyToken, requireAdmin, proxyToTaskService('/api/projects'));
  
  // DELETE /api/projects/:projectId/members/:userId - Solo ADMIN puede eliminar miembros
  app.delete('/api/projects/:projectId/members/:userId', verifyToken, requireAdmin, proxyToTaskService('/api/projects'));

  // ========================================
  // TASK SERVICE ROUTES - TASKS
  // ========================================
  
  // GET /api/projects/:projectId/tasks - Obtener todas las tareas de un proyecto
  app.get('/api/projects/:projectId/tasks', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // GET /api/projects/:projectId/tasks/:taskId - Obtener una tarea específica
  app.get('/api/projects/:projectId/tasks/:taskId', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // POST /api/projects/:projectId/tasks - Crear nueva tarea (todos los usuarios autenticados)
  app.post('/api/projects/:projectId/tasks', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // PUT /api/projects/:projectId/tasks/:taskId - Actualizar tarea
  app.put('/api/projects/:projectId/tasks/:taskId', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // POST /api/projects/:projectId/tasks/:taskId/status - Cambiar estado de tarea
  app.post('/api/projects/:projectId/tasks/:taskId/status', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // DELETE /api/projects/:projectId/tasks/:taskId - Eliminar tarea (solo ADMIN)
  app.delete('/api/projects/:projectId/tasks/:taskId', verifyToken, requireAdmin, proxyToTaskService('/api/projects'));

  // ========================================
  // TASK SERVICE ROUTES - TASK MEMBERS
  // ========================================
  
  // GET /api/projects/:projectId/tasks/:taskId/members - Obtener usuarios asignados
  app.get('/api/projects/:projectId/tasks/:taskId/members', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // POST /api/projects/:projectId/tasks/:taskId/members - Asignar usuario a tarea
  app.post('/api/projects/:projectId/tasks/:taskId/members', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // DELETE /api/projects/:projectId/tasks/:taskId/members/:userId - Remover usuario de tarea
  app.delete('/api/projects/:projectId/tasks/:taskId/members/:userId', verifyToken, requireUser, proxyToTaskService('/api/projects'));

  // ========================================
  // TASK SERVICE ROUTES - NOTES
  // ========================================
  
  // GET /api/projects/:projectId/tasks/:taskId/notes - Obtener notas de tarea
  app.get('/api/projects/:projectId/tasks/:taskId/notes', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // POST /api/projects/:projectId/tasks/:taskId/notes - Crear nota
  app.post('/api/projects/:projectId/tasks/:taskId/notes', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // PUT /api/projects/:projectId/tasks/:taskId/notes/:noteId - Editar nota (solo creador)
  app.put('/api/projects/:projectId/tasks/:taskId/notes/:noteId', verifyToken, requireUser, proxyToTaskService('/api/projects'));
  
  // DELETE /api/projects/:projectId/tasks/:taskId/notes/:noteId - Eliminar nota (solo creador)
  app.delete('/api/projects/:projectId/tasks/:taskId/notes/:noteId', verifyToken, requireUser, proxyToTaskService('/api/projects'));

  // ========================================
  // TASK SERVICE ROUTES - NOTES
  // ========================================
  
  // Todas las rutas de notas requieren autenticación
  app.use('/api/notes', verifyToken, requireUser, proxyToTaskService('/api/notes'));

  console.log(' Proxies configurados con autenticación JWT');
  console.log(`   AUTH Service: ${AUTH_SERVICE_URL}`);
  console.log(`   TASK Service: ${TASK_SERVICE_URL}`);
  console.log('');
  console.log(' Rutas protegidas:');
  console.log('   Públicas:');
  console.log('     POST /api/auth/login');
  console.log('   Requieren JWT (user o admin):');
  console.log('     GET  /api/auth/me');
  console.log('     GET  /api/projects');
  console.log('     GET  /api/projects/:projectId/tasks');
  console.log('     POST /api/projects/:projectId/tasks');
  console.log('     PUT  /api/projects/:projectId/tasks/:taskId');
  console.log('   Solo ADMIN:');
  console.log('     POST /api/auth/register');
  console.log('     GET  /api/auth/users');
  console.log('     POST /api/projects');
  console.log('     PUT  /api/projects/:id');
  console.log('     DELETE /api/projects/:id');
  console.log('     GET  /api/projects/:projectId/members');
  console.log('     POST /api/projects/:projectId/members');
  console.log('     DELETE /api/projects/:projectId/members/:userId');
  console.log('     DELETE /api/projects/:projectId/tasks/:taskId');
}

// Helper function para crear proxy al task service
function proxyToTaskService(basePath: string) {
  const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:3000';
  
  return createProxyMiddleware({
    target: TASK_SERVICE_URL,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq: any, req: AuthRequest) => {
        console.log(`[Task Service] ${req.method} ${req.path} - User: ${req.user?.id} (${req.user?.role})`);
        
        // Pasar información del usuario al microservicio
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
        
        // Preservar Authorization header
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      proxyRes: (proxyRes: any, req: any) => {
        console.log(`[Task Service Response] ${proxyRes.statusCode} ${req.path}`);
      },
      error: handleProxyError
    }
  });
}

// Helper function para manejar errores de proxy
function handleProxyError(err: any, req: any, res: any) {
  console.error(`[Proxy Error] ${req.path}:`, err.message);
  
  if (!res.headersSent) {
    res.status(503).json({
      error: 'Servicio no disponible',
      message: 'El microservicio no está disponible en este momento',
      service: req.path.split('/')[2] // auth, projects, tasks, notes
    });
  }
}
