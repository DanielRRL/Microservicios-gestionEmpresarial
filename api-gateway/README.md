# API Gateway

Proxy y validación JWT para microservicios.

## Instalación

```bash
npm install
cp .env.example .env
```

## Scripts

```bash
npm run dev    # Desarrollo
npm run build  # Compilar
npm start      # Producción
```

## Configuración

```env
PORT=4000
JWT_SECRET=tu-secreto
AUTH_SERVICE_URL=http://localhost:4001
TASK_SERVICE_URL=http://localhost:3000
```
