import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware de validación de datos
 * Verifica que los datos de la petición cumplan con las reglas definidas en las rutas
 * Si hay errores, devuelve un 400 con la lista de errores
 * 
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Función para pasar al siguiente middleware
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Obtiene los errores de validación acumulados por express-validator
  const errors = validationResult(req);

  // Si hay errores, devuelve un 400 con la lista de errores
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // Si no hay errores, continúa con el siguiente middleware o controlador
  next();
};
