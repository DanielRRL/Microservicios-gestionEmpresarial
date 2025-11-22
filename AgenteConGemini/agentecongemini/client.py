import asyncio
import sys
import os
from pathlib import Path
from typing import Literal, Optional
from mirascope.core import google, prompt_template, BaseTool
from pydantic import BaseModel, Field
from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client

# ==================== HERRAMIENTAS PARA GEMINI ====================

class GetAllProjectsTool(BaseTool):
    """Obtiene todos los proyectos disponibles"""
    
    def call(self) -> str:
        return "get_all_projects"

class GetProjectByIdTool(BaseTool):
    """Obtiene un proyecto específico por su ID"""
    project_id: str = Field(description="ID del proyecto a buscar")
    
    def call(self) -> str:
        return f"get_project_by_id:{self.project_id}"

class CreateProjectTool(BaseTool):
    """Crea un nuevo proyecto"""
    name: str = Field(description="Nombre del proyecto")
    description: str = Field(description="Descripción del proyecto")
    client_name: str = Field(description="Nombre del cliente", default="")
    
    def call(self) -> str:
        return f"create_project:{self.name}"

class UpdateProjectTool(BaseTool):
    """Actualiza un proyecto existente"""
    project_id: str = Field(description="ID del proyecto")
    name: str = Field(description="Nuevo nombre del proyecto", default="")
    description: str = Field(description="Nueva descripción", default="")
    client_name: str = Field(description="Nuevo nombre del cliente", default="")
    
    def call(self) -> str:
        return f"update_project:{self.project_id}"

class DeleteProjectTool(BaseTool):
    """Elimina un proyecto"""
    project_id: str = Field(description="ID del proyecto a eliminar")
    
    def call(self) -> str:
        return f"delete_project:{self.project_id}"

class GetTasksByProjectTool(BaseTool):
    """Obtiene todas las tareas de un proyecto"""
    project_id: str = Field(description="ID del proyecto")
    
    def call(self) -> str:
        return f"get_tasks_by_project:{self.project_id}"

class GetTaskByIdTool(BaseTool):
    """Obtiene una tarea específica"""
    project_id: str = Field(description="ID del proyecto")
    task_id: str = Field(description="ID de la tarea")
    
    def call(self) -> str:
        return f"get_task_by_id:{self.project_id}:{self.task_id}"

class CreateTaskTool(BaseTool):
    """Crea una nueva tarea en un proyecto"""
    project_id: str = Field(description="ID del proyecto")
    name: str = Field(description="Nombre de la tarea")
    description: str = Field(description="Descripción de la tarea", default="")
    
    def call(self) -> str:
        return f"create_task:{self.project_id}:{self.name}"

class UpdateTaskTool(BaseTool):
    """Actualiza una tarea existente"""
    project_id: str = Field(description="ID del proyecto")
    task_id: str = Field(description="ID de la tarea")
    name: str = Field(description="Nuevo nombre", default="")
    description: str = Field(description="Nueva descripción", default="")
    
    def call(self) -> str:
        return f"update_task:{self.project_id}:{self.task_id}"

class UpdateTaskStatusTool(BaseTool):
    """Actualiza el estado de una tarea"""
    project_id: str = Field(description="ID del proyecto")
    task_id: str = Field(description="ID de la tarea")
    status: Literal["pending", "onHold", "inProgress", "underReview", "completed"] = Field(description="Nuevo estado")
    
    def call(self) -> str:
        return f"update_task_status:{self.project_id}:{self.task_id}:{self.status}"

class DeleteTaskTool(BaseTool):
    """Elimina una tarea"""
    project_id: str = Field(description="ID del proyecto")
    task_id: str = Field(description="ID de la tarea")
    
    def call(self) -> str:
        return f"delete_task:{self.project_id}:{self.task_id}"

class GetNotesByTaskTool(BaseTool):
    """Obtiene todas las notas de una tarea"""
    project_id: str = Field(description="ID del proyecto")
    task_id: str = Field(description="ID de la tarea")
    
    def call(self) -> str:
        return f"get_notes_by_task:{self.project_id}:{self.task_id}"

class CreateNoteTool(BaseTool):
    """Crea una nota en una tarea"""
    project_id: str = Field(description="ID del proyecto")
    task_id: str = Field(description="ID de la tarea")
    content: str = Field(description="Contenido de la nota")
    
    def call(self) -> str:
        return f"create_note:{self.project_id}:{self.task_id}"

class DeleteNoteTool(BaseTool):
    """Elimina una nota"""
    project_id: str = Field(description="ID del proyecto")
    task_id: str = Field(description="ID de la tarea")
    note_id: str = Field(description="ID de la nota")
    
    def call(self) -> str:
        return f"delete_note:{self.project_id}:{self.task_id}:{self.note_id}"

# ==================== MAPEO DE HERRAMIENTAS ====================
TOOL_NAME_MAP = {
    "GetAllProjectsTool": "get_all_projects",
    "GetProjectByIdTool": "get_project_by_id",
    "CreateProjectTool": "create_project",
    "UpdateProjectTool": "update_project",
    "DeleteProjectTool": "delete_project",
    "GetTasksByProjectTool": "get_tasks_by_project",
    "GetTaskByIdTool": "get_task_by_id",
    "CreateTaskTool": "create_task",
    "UpdateTaskTool": "update_task",
    "UpdateTaskStatusTool": "update_task_status",
    "DeleteTaskTool": "delete_task",
    "GetNotesByTaskTool": "get_notes_by_task",
    "CreateNoteTool": "create_note",
    "DeleteNoteTool": "delete_note",
}

# ✅ Función async con decorador
@google.call(
    model="gemini-2.0-flash-exp",
    tools=[
        GetAllProjectsTool,
        GetProjectByIdTool,
        CreateProjectTool,
        UpdateProjectTool,
        DeleteProjectTool,
        GetTasksByProjectTool,
        GetTaskByIdTool,
        CreateTaskTool,
        UpdateTaskTool,
        UpdateTaskStatusTool,
        DeleteTaskTool,
        GetNotesByTaskTool,
        CreateNoteTool,
        DeleteNoteTool,
    ]
)
@prompt_template("Usuario: {query}\n\nAnaliza la consulta y usa la herramienta apropiada para gestionar proyectos, tareas y notas.")
async def analyze_query(query: str): ...

async def execute_query(query: str):
    try:
        # Analizar query con Gemini
        print(f"🤔 Analizando con Gemini: '{query}'")
        response = await analyze_query(query)
        
        # Si no hay tool call, solo responder
        if not response.tool:
            print(f"\n💬 Respuesta de Gemini:")
            print(response.content)
            return response.content
        
        # Extraer información de la herramienta
        tool_class_name = type(response.tool).__name__
        tool_name = TOOL_NAME_MAP.get(tool_class_name)
        
        if not tool_name:
            print(f"❌ Herramienta no encontrada: {tool_class_name}")
            return
        
        tool_args = response.tool.model_dump(exclude_unset=True)
        
        print(f"🔧 Herramienta seleccionada: {tool_name}")
        print(f"📋 Argumentos: {tool_args}")
        
        # Conectar al servidor MCP y ejecutar
        print("🔄 Conectando con servidor MCP...")
        
        server_params = StdioServerParameters(
            command=sys.executable,
            args=["-m", "agentecongemini.server"],
            env=None
        )
        
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                print("✅ Conectado al servidor MCP")
                
                await session.initialize()
                print("✅ Sesión inicializada")
                
                print(f"⚙️  Ejecutando herramienta...")
                result = await session.call_tool(tool_name, tool_args)
                
                print(f"\n✅ Resultado:")
                print(result.content)
                return result.content
                    
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"   Mensaje: {str(e)}")
        import traceback
        traceback.print_exc()
        raise  # Re-lanzar para que la API pueda manejarlo


async def execute_query_silent(query: str):
    """
    Versión silenciosa de execute_query para uso en API REST.
    No imprime en consola, solo retorna el resultado o lanza excepciones.
    
    Args:
        query: Consulta del usuario en lenguaje natural
        
    Returns:
        str: Respuesta del agente (contenido de texto o JSON)
        
    Raises:
        Exception: Si ocurre algún error durante el procesamiento
    """
    try:
        # Analizar query con Gemini (sin prints)
        response = await analyze_query(query)
        
        # Si no hay tool call, solo responder
        if not response.tool:
            return response.content
        
        # Extraer información de la herramienta
        tool_class_name = type(response.tool).__name__
        tool_name = TOOL_NAME_MAP.get(tool_class_name)
        
        if not tool_name:
            raise ValueError(f"Herramienta no encontrada: {tool_class_name}")
        
        tool_args = response.tool.model_dump(exclude_unset=True)
        
        # Conectar al servidor MCP y ejecutar
        server_params = StdioServerParameters(
            command=sys.executable,
            args=["-m", "agentecongemini.server"],
            env=None
        )
        
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(tool_name, tool_args)
                return result.content
                    
    except Exception as e:
        # Re-lanzar con información del error
        raise Exception(f"Error procesando consulta: {str(e)}") from e