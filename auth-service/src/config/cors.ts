import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
