#!/bin/bash
# Script para iniciar la API REST del Agente IA

echo "🚀 Iniciando API REST del Agente IA..."
echo ""

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Variables de entorno cargadas desde .env"
else
    echo "⚠️  Archivo .env no encontrado"
fi

# Verificar que GOOGLE_API_KEY esté configurada
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Error: GOOGLE_API_KEY no está configurada"
    echo "   Crea un archivo .env con: GOOGLE_API_KEY=tu_clave_aqui"
    exit 1
fi

echo "✅ GOOGLE_API_KEY configurada"
echo ""
echo "📡 API disponible en:"
echo "   - http://localhost:8000"
echo "   - Documentación: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Ejecutar con uv
uv run uvicorn agentecongemini.api:app --reload --host 0.0.0.0 --port 8000
