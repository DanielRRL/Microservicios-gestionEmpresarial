"""
API REST para el Agente IA
Proporciona endpoints HTTP para interactuar con el agente sin afectar la CLI existente.
"""
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Importar la función silenciosa para la API
from .client import execute_query_silent

# ==================== MODELOS ====================

class ChatRequest(BaseModel):
    """Modelo para solicitudes de chat"""
    message: str = Field(..., description="Mensaje del usuario", min_length=1)

class ChatResponse(BaseModel):
    """Modelo para respuestas de chat"""
    response: str = Field(..., description="Respuesta del agente")
    success: bool = Field(..., description="Indica si la operación fue exitosa")
    error: Optional[str] = Field(None, description="Mensaje de error si ocurrió alguno")

class HealthResponse(BaseModel):
    """Modelo para el health check"""
    status: str
    message: str
    api_key_configured: bool

# ==================== APLICACIÓN FASTAPI ====================

app = FastAPI(
    title="Agente IA - API REST",
    description="API para interactuar con el agente de gestión de tareas usando Gemini",
    version="1.0.0"
)

# Configurar CORS para permitir conexión desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== ENDPOINTS ====================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Verifica el estado del servicio y la configuración.
    """
    api_key_present = bool(os.getenv("GOOGLE_API_KEY"))
    
    return HealthResponse(
        status="ok" if api_key_present else "warning",
        message="Agente IA funcionando correctamente" if api_key_present else "GOOGLE_API_KEY no configurada",
        api_key_configured=api_key_present
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Procesa una consulta del usuario usando el agente IA.
    
    El agente analiza la consulta con Gemini, selecciona la herramienta apropiada
    y ejecuta la acción correspondiente en el task-service.
    
    Args:
        request: Objeto con el mensaje del usuario
        
    Returns:
        ChatResponse con la respuesta del agente
        
    Raises:
        HTTPException: Si ocurre un error durante el procesamiento
    """
    # Validar que existe la API key
    if not os.getenv("GOOGLE_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_API_KEY no configurada. Verifica el archivo .env"
        )
    
    try:
        # Usar la función silenciosa para evitar prints en consola
        # Esta función retorna el resultado sin imprimir logs
        result = await execute_query_silent(request.message)
        
        # Convertir el resultado a string si es necesario
        response_text = str(result) if result else "Operación completada exitosamente"
        
        return ChatResponse(
            response=response_text,
            success=True,
            error=None
        )
        
    except Exception as e:
        # Log del error para debugging
        error_message = f"Error procesando consulta: {str(e)}"
        print(f"❌ {error_message}")
        
        # Retornar error en lugar de lanzar excepción HTTP
        # Esto permite que el frontend maneje el error de manera más elegante
        return ChatResponse(
            response=f"Lo siento, ocurrió un error al procesar tu solicitud: {str(e)}",
            success=False,
            error=error_message
        )

@app.get("/")
async def root():
    """
    Endpoint raíz con información básica de la API
    """
    return {
        "name": "Agente IA API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "chat": "/api/chat (POST)",
            "docs": "/docs"
        }
    }

# ==================== PUNTO DE ENTRADA ====================

def start_server(host: str = "0.0.0.0", port: int = 8000, reload: bool = False):
    """
    Inicia el servidor FastAPI
    
    Args:
        host: Host donde escuchar (default: 0.0.0.0)
        port: Puerto donde escuchar (default: 8000)
        reload: Si activar auto-reload en desarrollo (default: False)
    """
    uvicorn.run(
        "agentecongemini.api:app",
        host=host,
        port=port,
        reload=reload
    )

if __name__ == "__main__":
    start_server(reload=True)
