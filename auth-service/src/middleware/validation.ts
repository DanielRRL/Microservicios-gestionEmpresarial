import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: 'Validación fallida',
      details: errors.array() 
    });
    return;
  }
  
  next();
};

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('El rol debe ser "admin" o "user"'),
  
  validateRequest
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  validateRequest
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  validateRequest
];

export const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  validateRequest
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  
  validateRequest
];
