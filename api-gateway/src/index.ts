import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { corsConfig } from './config/cors';
import { generalLimiter, authLimiter } from './config/rateLimit';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { setupProxies } from './routes';

dotenv.config();

const app = express();

// ========================================
// SECURITY MIDDLEWARES
// ========================================
app.use(helmet()); // Seguridad HTTP headers
app.use(cors(corsConfig)); // CORS configurado
// NOTE: express.json() se aplica por ruta en setupProxies para evitar conflictos con proxies

// ========================================
// LOGGING
// ========================================
app.use(requestLogger);

// ========================================
// RATE LIMITING
// ========================================
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', generalLimiter);

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      task: process.env.TASK_SERVICE_URL || 'http://localhost:4002'
    }
  });
});

// ========================================
// STATUS ENDPOINT
// ========================================
app.get('/api/status', (req, res) => {
  res.json({
    gateway: 'online',
    version: '1.0.0',
    services: [
      { name: 'auth', url: process.env.AUTH_SERVICE_URL },
      { name: 'task', url: process.env.TASK_SERVICE_URL }
    ]
  });
});

// ========================================
// PROXY ROUTES
// ========================================
setupProxies(app);

// ========================================
// ERROR HANDLER (debe ir al final)
// ========================================
app.use(errorHandler);

// ========================================
// 404 HANDLER
// ========================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableRoutes: [
      'GET /health',
      'GET /api/status',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/projects/:id/tasks'
    ]
  });
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║                                                    ║');
  console.log('║         🌐 API GATEWAY RUNNING                     ║');
  console.log('║                                                    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  console.log(` Port: ${PORT}`);
  console.log(` Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:4001'}`);
  console.log(` Task Service: ${process.env.TASK_SERVICE_URL || 'http://localhost:4002'}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health            - Health check');
  console.log('  GET  /api/status        - Services status');
  console.log('  POST /api/auth/*        - Auth endpoints');
  console.log('  *    /api/projects/*    - Project endpoints');
  console.log('  *    /api/tasks/*       - Task endpoints');
  console.log('  *    /api/notes/*       - Note endpoints');
  console.log('');
});
