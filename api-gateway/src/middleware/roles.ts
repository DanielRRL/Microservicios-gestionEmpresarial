import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Middleware para verificar si el usuario tiene rol admin
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Debe estar autenticado'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requiere rol de administrador'
    });
  }

  next();
};

/**
 * Middleware para verificar si el usuario tiene rol user o admin
 */
export const requireUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Debe estar autenticado'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'user') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'No tiene permisos suficientes'
    });
  }

  next();
};

/**
 * Middleware genérico para verificar roles específicos
 */
export const requireRole = (...roles: Array<'admin' | 'user'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Debe estar autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};
