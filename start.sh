#!/bin/bash

# 🚀 Script de Inicio Completo de LoyesTask
# Este script inicia todos los servicios necesarios

set -e  # Salir si hay algún error

echo "🎯 ======================================"
echo "🚀 LoyesTask - Sistema Completo"
echo "🎯 ======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Puerto $port ya está en uso${NC}"
        return 1
    fi
    return 0
}

# Función para esperar que un servicio esté disponible
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${BLUE}⏳ Esperando a que $name esté disponible...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $name está listo${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    
    echo -e "${YELLOW}⚠️  $name no respondió después de $max_attempts intentos${NC}"
    return 1
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker no está instalado. Por favor, instala Docker primero.${NC}"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose no está instalado. Por favor, instala Docker Compose primero.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Verificando archivos de configuración...${NC}"

# Verificar archivos .env
ENV_FILES=(
    "api-gateway/.env"
    "auth-service/.env"
    "task-service/.env"
)

for env_file in "${ENV_FILES[@]}"; do
    if [ ! -f "$env_file" ]; then
        echo -e "${YELLOW}⚠️  Falta archivo $env_file${NC}"
        echo -e "${BLUE}📝 Creando desde .env.example...${NC}"
        
        example_file="${env_file}.example"
        if [ -f "$example_file" ]; then
            cp "$example_file" "$env_file"
            echo -e "${GREEN}✅ Creado $env_file${NC}"
        else
            echo -e "${YELLOW}⚠️  No se encontró $example_file${NC}"
        fi
    else
        echo -e "${GREEN}✅ $env_file existe${NC}"
    fi
done

echo ""
echo -e "${BLUE}🐳 Iniciando servicios con Docker Compose...${NC}"
echo ""

# Detener servicios previos si existen
docker-compose down 2>/dev/null || true

# Construir imágenes
echo -e "${BLUE}🏗️  Construyendo imágenes Docker...${NC}"
docker-compose build

# Iniciar servicios
echo -e "${BLUE}🚀 Iniciando servicios...${NC}"
docker-compose up -d

echo ""
echo -e "${BLUE}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 5

# Verificar servicios
echo ""
echo -e "${BLUE}🔍 Verificando servicios...${NC}"

wait_for_service "http://localhost:5432" "PostgreSQL"
wait_for_service "http://localhost:27017" "MongoDB"
wait_for_service "http://localhost:4001/health" "Auth Service"
wait_for_service "http://localhost:3000/health" "Task Service"
wait_for_service "http://localhost:4000/health" "API Gateway"

echo ""
echo -e "${GREEN}✅ ======================================"
echo -e "✅ TODOS LOS SERVICIOS ESTÁN ACTIVOS"
echo -e "✅ ======================================${NC}"
echo ""

echo -e "${BLUE}📊 Estado de los servicios:${NC}"
echo ""
docker-compose ps

echo ""
echo -e "${BLUE}🌐 URLs de acceso:${NC}"
echo ""
echo -e "  ${GREEN}🔐 API Gateway:${NC}     http://localhost:4000"
echo -e "  ${GREEN}👤 Auth Service:${NC}    http://localhost:4001"
echo -e "  ${GREEN}📋 Task Service:${NC}    http://localhost:3000"
echo -e "  ${GREEN}🗄️  PostgreSQL:${NC}      localhost:5432"
echo -e "  ${GREEN}🍃 MongoDB:${NC}         localhost:27017"
echo ""

echo -e "${BLUE}📝 Endpoints disponibles:${NC}"
echo ""
echo -e "  ${YELLOW}Públicos:${NC}"
echo -e "    POST http://localhost:4000/api/auth/register"
echo -e "    POST http://localhost:4000/api/auth/login"
echo ""
echo -e "  ${YELLOW}Protegidos (requieren token):${NC}"
echo -e "    GET  http://localhost:4000/api/projects"
echo -e "    GET  http://localhost:4000/api/tasks"
echo -e "    POST http://localhost:4000/api/tasks"
echo ""
echo -e "  ${YELLOW}Solo Admin:${NC}"
echo -e "    POST http://localhost:4000/api/projects"
echo -e "    PUT  http://localhost:4000/api/projects/:id"
echo -e "    DELETE http://localhost:4000/api/projects/:id"
echo ""

echo -e "${BLUE}🛠️  Comandos útiles:${NC}"
echo ""
echo -e "  ${GREEN}Ver logs:${NC}              docker-compose logs -f"
echo -e "  ${GREEN}Ver logs de un servicio:${NC} docker-compose logs -f api-gateway"
echo -e "  ${GREEN}Detener servicios:${NC}     docker-compose down"
echo -e "  ${GREEN}Reiniciar:${NC}             docker-compose restart"
echo -e "  ${GREEN}Estado:${NC}                docker-compose ps"
echo ""

echo -e "${BLUE}📚 Siguiente paso:${NC}"
echo ""
echo -e "  1. ${GREEN}Crear usuario admin:${NC}"
echo -e "     docker-compose exec auth-service npm run create-admin"
echo ""
echo -e "  2. ${GREEN}Probar login:${NC}"
echo -e "     curl -X POST http://localhost:4000/api/auth/login \\"
echo -e "       -H 'Content-Type: application/json' \\"
echo -e "       -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'"
echo ""
echo -e "  3. ${GREEN}Iniciar frontend:${NC}"
echo -e "     cd loyestaskFrontend"
echo -e "     npm install"
echo -e "     npm run dev"
echo ""

echo -e "${GREEN}🎉 Sistema iniciado correctamente!${NC}"
echo ""
