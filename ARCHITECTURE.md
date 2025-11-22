# 🏗️ LoyesTask - Arquitectura de Microservicios

## 📐 Arquitectura del Sistema

```
┌─────────────────┐
│  React Frontend │  (Puerto 5173)
│   (Vite + TS)   │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │ (todas las peticiones)
         ▼
┌─────────────────────────────────────┐
│         API GATEWAY                 │  (Puerto 4000)
│  - Autenticación JWT centralizada   │
│  - Control de roles (admin/user)    │
│  - Rate limiting                    │
│  - CORS                             │
│  - Proxy a microservicios           │
└──────────┬────────────┬─────────────┘
           │            │
    ┌──────▼──────┐   ┌▼────────────┐
    │             │   │              │
    │ Auth Service│   │ Task Service │
    │ (Puerto     │   │ (Puerto      │
    │  4001)      │   │  3000)       │
    │             │   │              │
    │ - Register  │   │ - Projects   │
    │ - Login     │   │ - Tasks      │
    │ - JWT       │   │ - Notes      │
    │ - Usuarios  │   │              │
    │             │   │              │
    └──────┬──────┘   └┬─────────────┘
           │           │
           │           │
    ┌──────▼──────┐   ┌▼─────────────┐
    │             │   │              │
    │ PostgreSQL  │   │   MongoDB    │
    │ (Puerto     │   │  (Puerto     │
    │  5432)      │   │   27017)     │
    │             │   │              │
    │ - Users     │   │ - Projects   │
    │ - Tokens    │   │ - Tasks      │
    │             │   │ - Notes      │
    └─────────────┘   └──────────────┘
```

## 🔐 Flujo de Autenticación

### 1. Registro de Usuario (Solo Admin)
```
Admin Frontend → API Gateway (con JWT admin)
                      ↓
                Auth Service → PostgreSQL
                      ↓
           Crea usuario con role
                      ↓
Admin Frontend ← API Gateway ← {user}
```

### 2. Login
```
Frontend → API Gateway → Auth Service
           (no requiere JWT)
                ↓
         Verifica credenciales en PostgreSQL
                ↓
         Genera JWT con {id, role}
                ↓
Frontend ← API Gateway ← {token, user}
```

### 3. Peticiones Protegidas
```
Frontend → API Gateway
           ↓
      Verifica JWT
           ↓
    Extrae {id, role}
           ↓
    Valida permisos
           ↓
    Agrega headers:
    - X-User-Id
    - X-User-Role
           ↓
    Auth/Task Service
```

## 🛡️ Control de Acceso por Rol

### Rutas Públicas (sin JWT)
```typescript
POST /api/auth/login
```

### Rutas para Usuarios Autenticados (user o admin)
```typescript
GET  /api/auth/me
POST /api/auth/change-password

GET  /api/projects
GET  /api/projects/:id
GET  /api/projects/:id/tasks

GET  /api/tasks
POST /api/tasks
GET  /api/tasks/:id
PUT  /api/tasks/:id

GET  /api/notes
POST /api/notes
DELETE /api/notes/:id
```

### Rutas Solo para Administradores
```typescript
POST   /api/auth/register    // Crear usuario
POST   /api/projects         // Crear proyecto
PUT    /api/projects/:id     // Actualizar proyecto
DELETE /api/projects/:id     // Eliminar proyecto
DELETE /api/tasks/:id        // Eliminar tarea
```

## 📦 Microservicios

### API Gateway (Puerto 4000)
**Responsabilidades:**
- ✅ Punto de entrada único
- ✅ Validación de JWT
- ✅ Control de roles
- ✅ Rate limiting
- ✅ CORS
- ✅ Proxy a servicios

**Tecnologías:**
- Express.js + TypeScript
- jsonwebtoken
- http-proxy-middleware
- helmet (seguridad)
- express-rate-limit

### Auth Service (Puerto 4001)
**Responsabilidades:**
- ✅ Crear usuarios (solo admin)
- ✅ Login/Logout
- ✅ Generación de JWT
- ✅ Gestión de perfiles

**Tecnologías:**
- Express.js + TypeScript
- PostgreSQL (pg driver)
- bcrypt
- jsonwebtoken
- nodemailer

**Base de Datos:**
```sql
users:
  - id (UUID, PK)
  - name (VARCHAR)
  - email (VARCHAR, UNIQUE)
  - password (VARCHAR, hashed)
  - role (VARCHAR: 'admin' | 'user')
  - is_active (BOOLEAN)
  - created_at, updated_at

tokens:
  - id (UUID, PK)
  - token (VARCHAR)
  - user_id (UUID, FK)
  - type ('passwordReset')
  - expires_at (TIMESTAMP)
```

### Task Service (Puerto 3000)
**Responsabilidades:**
- ✅ CRUD de proyectos
- ✅ CRUD de tareas
- ✅ CRUD de notas
- ✅ Relaciones entre entidades

**Tecnologías:**
- Express.js + TypeScript
- MongoDB (Mongoose)

**Colecciones:**
```typescript
Projects:
  - _id (ObjectId)
  - name
  - description
  - userId
  - clientName
  - isActive
  - createdAt, updatedAt

Tasks:
  - _id (ObjectId)
  - name
  - description
  - projectId (ref Projects)
  - status ('pending' | 'in-progress' | 'completed')
  - completedBy[]
  - createdAt, updatedAt

Notes:
  - _id (ObjectId)
  - content
  - createdBy (userId)
  - taskId (ref Tasks)
  - createdAt
```

## 🔑 Variables de Entorno

### API Gateway
```env
PORT=4000
NODE_ENV=development
JWT_SECRET=same-as-auth-service
AUTH_SERVICE_URL=http://localhost:4001
TASK_SERVICE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### Auth Service
```env
PORT=4001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/loyestask
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASSWORD=your-password
FRONTEND_URL=http://localhost:5173
```

### Task Service
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskdb
```

## 🚀 Despliegue

### Opción 1: Local con Docker Compose

```bash
# Iniciar todo el sistema
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Opción 2: Railway (Monorepo)

**Estructura:**
```
loyestask/
├── api-gateway/
│   ├── railway.json
│   └── ...
├── auth-service/
│   ├── railway.json
│   └── ...
├── task-service/
│   ├── railway.json
│   └── ...
└── react-chat-app/
    └── ...
```

**Pasos:**

1. **Crear proyecto en Railway**
2. **Agregar PostgreSQL**: Para auth-service
3. **Agregar MongoDB**: Para task-service
4. **Deployar servicios**:
   - API Gateway (root path: `/api-gateway`)
   - Auth Service (root path: `/auth-service`)
   - Task Service (root path: `/task-service`)

5. **Configurar variables de entorno** en cada servicio:
   ```
   Auth Service:
   - DATABASE_URL (automático de Railway)
   - JWT_SECRET
   - EMAIL_*
   
   Task Service:
   - MONGO_URI (automático de Railway)
   
   API Gateway:
   - JWT_SECRET (mismo que auth)
   - AUTH_SERVICE_URL (URL interna de Railway)
   - TASK_SERVICE_URL (URL interna de Railway)
   - FRONTEND_URL (URL del frontend en Railway)
   ```

6. **Frontend**: Deployar React app y configurar `VITE_API_URL` a la URL del API Gateway

### Opción 3: Railway (Repos Separados)

**Ventajas:**
- ✅ Despliegues independientes
- ✅ Control de versiones separado
- ✅ Más fácil de mantener

**Crear 3 repositorios:**
1. `loyestask-gateway`
2. `loyestask-auth-service`
3. `loyestask-task-service`

**Railway detecta automáticamente:**
- `railway.json`
- `Dockerfile`
- `package.json`

## 🧪 Testing Local

### 1. Sin Docker (servicios individuales)
```bash
# Terminal 1 - PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine

# Terminal 2 - MongoDB
docker run -d -p 27017:27017 mongo:7-jammy

# Terminal 3 - Auth Service
cd auth-service
npm install
cp .env.example .env
npm run migrate
npm run create-admin
npm run dev

# Terminal 4 - Task Service
cd task-service
npm install
cp .env.example .env
npm run dev

# Terminal 5 - API Gateway
cd api-gateway
npm install
cp .env.example .env
npm run dev

# Terminal 6 - Frontend
cd react-chat-app
npm install
npm run dev
```

### 2. Con Docker Compose
```bash
# Iniciar bases de datos y servicios
docker-compose up -d

# Frontend local (más rápido para desarrollo)
cd react-chat-app
npm run dev
```

## 🔍 Endpoints

### Auth Service (vía API Gateway)
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                (requiere JWT)
POST   /api/auth/change-password   (requiere JWT)
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Task Service (vía API Gateway)
```
GET    /api/projects              (JWT: user/admin)
POST   /api/projects              (JWT: admin)
GET    /api/projects/:id          (JWT: user/admin)
PUT    /api/projects/:id          (JWT: admin)
DELETE /api/projects/:id          (JWT: admin)

GET    /api/tasks                 (JWT: user/admin)
POST   /api/tasks                 (JWT: user/admin)
GET    /api/tasks/:id             (JWT: user/admin)
PUT    /api/tasks/:id             (JWT: user/admin)
DELETE /api/tasks/:id             (JWT: admin)

GET    /api/notes                 (JWT: user/admin)
POST   /api/notes                 (JWT: user/admin)
DELETE /api/notes/:id             (JWT: user/admin)
```

## 📊 Monitoreo

**Health Checks:**
```
GET /health  # Cada servicio
```

**Logs:**
```bash
# Docker Compose
docker-compose logs -f [service]

# Railway
railway logs [service]
```

## 🔒 Seguridad

1. ✅ **JWT con expiración** (30 días)
2. ✅ **Passwords hasheados** (bcrypt)
3. ✅ **CORS restrictivo** en producción
4. ✅ **Rate limiting** en auth endpoints
5. ✅ **Helmet** para headers de seguridad
6. ✅ **Variables de entorno** para secretos
7. ✅ **Validación de datos** (express-validator)
8. ✅ **Roles** (admin/user)

## 🎓 Notas para Proyecto Universitario

- **Monorepo vs Repos separados**: Ambos funcionan en Railway
- **Docker**: Funciona perfectamente en Railway
- **PostgreSQL y MongoDB**: Railway los provee automáticamente
- **Escalabilidad**: Cada servicio se puede escalar independientemente
- **Logging**: Centralizadoen Railway
- **CI/CD**: Automático en cada push a main

---

**Documentación completa en:**
- `api-gateway/README.md`
- `auth-service/DEPLOYMENT.md`
- `task-service/README.md`
