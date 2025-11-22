# LoyesTask

Sistema de gestión de proyectos con microservicios.

## Arquitectura

- **Frontend** (Puerto 80) - React + TypeScript
- **API Gateway** (Puerto 4000) - Proxy + JWT
- **Auth Service** (Puerto 4001) - Usuarios
- **Task Service** (Puerto 3000) - Proyectos/Tareas
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
- PostgreSQL + MongoDB
- Docker
