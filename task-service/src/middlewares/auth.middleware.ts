import { Request, Response, NextFunction } from 'express';

/**
 * Extiende la interfaz Request de Express para incluir el userId
 * Esto permite acceder a req.userId en los controladores después de la autenticación
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Middleware de autenticación
 * Verifica que la petición incluya un token Bearer válido en el header Authorization
 * Extrae el userId del token y lo añade al objeto request
 * 
 * @param req - Request extendido con userId
 * @param res - Response de Express
 * @param next - Función para pasar al siguiente middleware
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // El API Gateway ya validó el JWT y envía el userId en el header X-User-Id
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({ error: 'User ID not provided by gateway' });
      return;
    }

    // Asignar userId al request para usarlo en controladores
    req.userId = userId;

    // Continúa con el siguiente middleware o controlador
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
