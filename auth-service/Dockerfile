# ==========================================
# Stage 1: Build
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Copiar scripts de migración compilados
COPY --from=builder /app/dist/scripts ./dist/scripts

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar ownership
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Comando de inicio (primero migraciones, luego admin, luego servidor)
CMD ["sh", "-c", "node dist/scripts/migrate.js && node dist/scripts/createAdmin.js && node dist/index.js"]
