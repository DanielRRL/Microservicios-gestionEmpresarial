import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UserModel } from '../models/User';

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const user = await UserModel.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
