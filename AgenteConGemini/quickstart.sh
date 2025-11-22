#!/bin/bash
# Script de Quick Start para probar la API

echo "🚀 Quick Start - API del Agente IA"
echo "===================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "pyproject.toml" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio AgenteConGemini"
    exit 1
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "❌ Error: Archivo .env no encontrado"
    echo "   Crea un archivo .env con tu GOOGLE_API_KEY"
    exit 1
fi

# Instalar/actualizar dependencias
echo "📦 Instalando dependencias..."
uv sync
echo ""

# Verificar GOOGLE_API_KEY
export $(cat .env | grep -v '^#' | xargs)
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Error: GOOGLE_API_KEY no está configurada en .env"
    exit 1
fi

echo "✅ Todo listo!"
echo ""
echo "📡 Iniciando API en http://localhost:8000"
echo "   - Health check: http://localhost:8000/api/health"
echo "   - Documentación: http://localhost:8000/docs"
echo ""
echo "💡 Tip: Abre otra terminal y ejecuta:"
echo "   uv run python test_api.py"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

# Iniciar API
uv run uvicorn agentecongemini.api:app --reload --host 0.0.0.0 --port 8000
