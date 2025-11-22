import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender Request para incluir user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'user';
  };
}

/**
 * Middleware para verificar JWT
 * Valida el token y extrae el payload
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    console.log(` [Auth Middleware] Path: ${req.path}, Header:`, authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token no proporcionado'
      });
    }

    // Verificar formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verificar token
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      console.error(' JWT_SECRET no está configurado');
      return res.status(500).json({
        error: 'Error de configuración',
        message: 'El servidor no está configurado correctamente'
      });
    }

    // Decodificar y verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: 'admin' | 'user';
    };

    console.log(` [Auth] User authenticated: ${decoded.id}, Role: ${decoded.role}`);

    // Agregar usuario al request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    console.error(` [Auth Error]:`, error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token expirado'
      });
    }

    console.error('Error verificando token:', error);
    return res.status(500).json({
      error: 'Error interno',
      message: 'Error verificando autenticación'
    });
  }
};

/**
 * Middleware opcional para rutas que pueden funcionar con o sin auth
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  try {
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const JWT_SECRET = process.env.JWT_SECRET;
      
      if (JWT_SECRET) {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          role: 'admin' | 'user';
        };
        
        req.user = {
          id: decoded.id,
          role: decoded.role
        };
      }
    }
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario
    console.log('Token inválido en ruta opcional');
  }

  next();
};
