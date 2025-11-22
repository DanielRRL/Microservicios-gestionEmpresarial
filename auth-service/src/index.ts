import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { corsConfig } from './config/cors';
import authRoutes from './routes/authRoutes';
import pool from './config/database';

dotenv.config();

const app = express();

// Middlewares
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ 
      status: 'AUTH Service OK',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`🚀 AUTH Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});

export default app;
