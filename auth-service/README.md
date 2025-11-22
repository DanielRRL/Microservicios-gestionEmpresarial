# Auth Service

Autenticación y usuarios con PostgreSQL.

## Instalación

```bash
npm install
cp .env.example .env
```

## Scripts

```bash
npm run dev          # Desarrollo
npm run migrate      # Migrar DB
npm run create-admin # Crear admin
```

## Configuración

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=tu-secreto
JWT_EXPIRES_IN=30d
```
