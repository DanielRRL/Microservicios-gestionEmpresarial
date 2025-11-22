# LoyesTask

Sistema de gestión de proyectos con microservicios.

## Arquitectura

- **Frontend** (Puerto 80) - React + TypeScript
- **API Gateway** (Puerto 4000) - Proxy + JWT
- **Auth Service** (Puerto 4001) - Usuarios
- **Task Service** (Puerto 3000) - Proyectos/Tareas
- **AI Agent** (Puerto 8000) - Asistente IA con Gemini
- **PostgreSQL** (Puerto 5432) - DB usuarios
- **MongoDB** (Puerto 27017) - DB tareas

## Inicio con Docker

```bash
docker-compose up -d
```

Accede a: `http://localhost`

Login:
- Email: `admin@test.com`
- Password: `admin123`

## Asistente IA

El administrador puede acceder al asistente IA desde el menu principal.
El agente puede ejecutar cualquier operación de administrador mediante lenguaje natural.

Ejemplos de consultas:
- "Muéstrame todos los proyectos"
- "Crea un proyecto llamado Sistema de Ventas"
- "Cuántas tareas tiene el proyecto X"

## Comandos

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## Stack

- React + TypeScript + Vite
- Node.js + Express + TypeScript
- Python + FastAPI + Google Gemini
- PostgreSQL + MongoDB
- Docker
