import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: function(origin, callback) {
    const whitelist = [];
    
    // Frontend URL
    if (process.env.FRONTEND_URL) {
      whitelist.push(process.env.FRONTEND_URL);
    }
    
    // Docker frontend (puerto 80)
    whitelist.push(
      'http://localhost',
      'http://localhost:80',
      'http://127.0.0.1',
      'http://127.0.0.1:80'
    );
    
    // Development URLs
    if (process.env.NODE_ENV !== 'production') {
      whitelist.push(
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174'
      );
    }
    
    // Railway domains
    if (process.env.NODE_ENV === 'production' && origin) {
      const isRailwayDomain = origin.includes('.railway.app') || 
                             origin.includes('.up.railway.app');
      if (isRailwayDomain) {
        whitelist.push(origin);
      }
    }
    
    const cleanWhitelist = [...new Set(whitelist.filter(Boolean))];
    
    console.log(`CORS check - Origin: ${origin}`);
    
    if (!origin || cleanWhitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Error de CORS - Origen no permitido'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};
