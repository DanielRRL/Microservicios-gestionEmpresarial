# Dockerfile para Agente IA con Gemini
FROM python:3.12-slim

# Configurar directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY pyproject.toml ./

# Instalar uv para gestión de dependencias (más rápido que pip)
RUN pip install --no-cache-dir uv

# Instalar dependencias del proyecto
RUN uv pip install --system --no-cache \
    mcp>=1.0.0 \
    "mirascope[google]>=1.0.0" \
    pydantic>=2.0.0 \
    httpx>=0.25.0 \
    fastapi>=0.104.0 \
    "uvicorn[standard]>=0.24.0" \
    python-dotenv

# Copiar código fuente
COPY agentecongemini/ ./agentecongemini/

# Exponer puerto de la API
EXPOSE 8000

# Variables de entorno
ENV PYTHONUNBUFFERED=1
ENV TASK_SERVICE_URL=http://task-service:3000

# Comando para iniciar la API
CMD ["python", "-m", "uvicorn", "agentecongemini.api:app", "--host", "0.0.0.0", "--port", "8000"]
