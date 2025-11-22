import { CorsOptions } from 'cors';

/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Define qué orígenes pueden acceder a la API y qué métodos están permitidos
 */

/**
 * Lista de orígenes permitidos para hacer peticiones a la API
 * En producción, reemplazar con los dominios reales
 */
const allowedOrigins = [
  'http://localhost',           // Frontend en producción (nginx puerto 80)
  'http://localhost:80',        // Frontend en producción (puerto explícito)
  'http://localhost:3000',      // Frontend en desarrollo
  'http://localhost:3001',      // Frontend alternativo
  'http://localhost:5173',      // Vite default port
  'http://localhost:4200',      // Angular default port
  // Agregar aquí los dominios de producción cuando estén disponibles
  // 'https://tu-dominio.com',
  // 'https://www.tu-dominio.com'
];

/**
 * Opciones de configuración de CORS
 * 
 * - origin: Verifica si el origen de la petición está permitido
 * - credentials: Permite el envío de cookies y headers de autenticación
 * - methods: Métodos HTTP permitidos
 * - allowedHeaders: Headers permitidos en las peticiones
 * - exposedHeaders: Headers que el cliente puede leer en la respuesta
 * - maxAge: Tiempo en segundos que el navegador puede cachear la respuesta preflight
 */
export const corsOptions: CorsOptions = {
  /**
   * Función que valida el origen de la petición
   * @param origin - URL del origen que hace la petición
   * @param callback - Función callback para permitir o denegar el acceso
   */
  origin: (origin, callback) => {
    // Permite peticiones sin origen (como Postman, curl, apps móviles)
    if (!origin) {
      return callback(null, true);
    }

    // Verifica si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  // Permite el envío de cookies y headers de autenticación
  credentials: true,

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Headers que pueden ser enviados en la petición
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  // Headers de respuesta que el cliente puede leer
  exposedHeaders: ['Content-Range', 'X-Content-Range'],

  // Cachea la respuesta preflight por 1 hora (3600 segundos)
  maxAge: 3600,
};
