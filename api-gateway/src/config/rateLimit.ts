import rateLimit from 'express-rate-limit';

// Rate limiter general (100 requests por 15 minutos)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para autenticación (5 intentos por 15 minutos)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de inicio de sesión, intenta de nuevo más tarde',
  skipSuccessfulRequests: true,
});
