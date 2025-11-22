import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { JWTService } from '../utils/jwt';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = JWTService.verify(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
