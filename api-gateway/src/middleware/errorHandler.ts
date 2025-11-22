import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handler]', err);
  
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Algo salió mal' 
      : err.message
  });
};
