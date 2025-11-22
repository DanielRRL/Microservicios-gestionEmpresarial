import asyncio
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional, Annotated
import httpx
from mcp.server import Server
from mcp.server.fastmcp import FastMCP
from mcp.types import Tool
from pydantic import BaseModel, Field, ConfigDict
from .auth import get_auth

# Modelos corregidos según tus schemas reales
class CompletedBy(BaseModel):
    """Modelo para el array completedBy de las tareas"""
    userId: str
    status: str

class Note(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(alias="_id")
    content: str
    createdBy: str
    taskId: str
    createdAt: str
    updatedAt: str

class Task(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(alias="_id")
    name: str
    description: str
    projectId: str
    status: str
    completedBy: List[CompletedBy] = []
    createdAt: str
    updatedAt: str

class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(alias="_id")
    name: str
    description: str
    userId: str
    clientName: Optional[str] = None
    isActive: bool = True
    createdAt: str
    updatedAt: str

# ✅ Cliente HTTP compartido
http_client: Optional[httpx.AsyncClient] = None
# Usar API Gateway en lugar de task-service directo
API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://api-gateway:4000")

async def get_http_client() -> httpx.AsyncClient:
    """Obtiene el cliente HTTP global"""
    global http_client
    if http_client is None:
        http_client = httpx.AsyncClient()
    return http_client

async def get_auth_headers() -> dict:
    """Obtiene headers de autenticación con JWT válido"""
    auth = get_auth()
    token = await auth.get_token()
    return {"Authorization": f"Bearer {token}"}

mcp = FastMCP("Task Management Agent")

# ==================== PROJECT ENDPOINTS ====================

@mcp.tool()
async def get_all_projects() -> List[Project]:
    """Obtiene todos los proyectos"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.get(f"{API_GATEWAY_URL}/api/projects", headers=headers)
    response.raise_for_status()
    projects_data = response.json()
    return [Project(**project) for project in projects_data]

@mcp.tool()
async def get_project_by_id(project_id: str) -> Project:
    """Obtiene un proyecto específico por ID"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.get(f"{API_GATEWAY_URL}/api/projects/{project_id}", headers=headers)
    response.raise_for_status()
    project_data = response.json()
    return Project(**project_data)

@mcp.tool()
async def create_project(name: str, description: str, client_name: str = "") -> Project:
    """Crea un nuevo proyecto"""
    client = await get_http_client()
    headers = await get_auth_headers()
    payload = {
        "name": name,
        "description": description,
        "clientName": client_name
    }
    response = await client.post(f"{API_GATEWAY_URL}/api/projects", json=payload, headers=headers)
    response.raise_for_status()
    project_data = response.json()
    return Project(**project_data)

@mcp.tool()
async def update_project(project_id: str, name: str = "", description: str = "", client_name: str = "") -> Project:
    """Actualiza un proyecto existente"""
    client = await get_http_client()
    headers = await get_auth_headers()
    payload = {}
    if name:
        payload["name"] = name
    if description:
        payload["description"] = description
    if client_name:
        payload["clientName"] = client_name
    
    response = await client.put(f"{API_GATEWAY_URL}/api/projects/{project_id}", json=payload, headers=headers)
    response.raise_for_status()
    project_data = response.json()
    return Project(**project_data)

@mcp.tool()
async def delete_project(project_id: str) -> Dict[str, str]:
    """Elimina un proyecto"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.delete(f"{API_GATEWAY_URL}/api/projects/{project_id}", headers=headers)
    response.raise_for_status()
    return {"message": "Project deleted successfully"}

# ==================== TASK ENDPOINTS ====================

@mcp.tool()
async def get_tasks_by_project(project_id: str) -> List[Task]:
    """Obtiene todas las tareas de un proyecto"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.get(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks", headers=headers)
    response.raise_for_status()
    tasks_data = response.json()
    return [Task(**task) for task in tasks_data]

@mcp.tool()
async def get_task_by_id(project_id: str, task_id: str) -> Task:
    """Obtiene una tarea específica por ID"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.get(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks/{task_id}", headers=headers)
    response.raise_for_status()
    task_data = response.json()
    return Task(**task_data)

@mcp.tool()
async def create_task(project_id: str, name: str, description: str = "") -> Task:
    """Crea una nueva tarea en un proyecto"""
    client = await get_http_client()
    headers = await get_auth_headers()
    payload = {
        "name": name,
        "description": description
    }
    response = await client.post(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks", json=payload, headers=headers)
    response.raise_for_status()
    task_data = response.json()
    return Task(**task_data)

@mcp.tool()
async def update_task(project_id: str, task_id: str, name: str = "", description: str = "") -> Task:
    """Actualiza una tarea existente"""
    client = await get_http_client()
    headers = await get_auth_headers()
    payload = {}
    if name:
        payload["name"] = name
    if description:
        payload["description"] = description
    
    response = await client.put(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks/{task_id}", json=payload, headers=headers)
    response.raise_for_status()
    task_data = response.json()
    return Task(**task_data)

@mcp.tool()
async def update_task_status(project_id: str, task_id: str, status: str) -> Task:
    """Actualiza el estado de una tarea"""
    client = await get_http_client()
    headers = await get_auth_headers()
    payload = {"status": status}
    response = await client.post(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks/{task_id}/status", json=payload, headers=headers)
    response.raise_for_status()
    task_data = response.json()
    return Task(**task_data)

@mcp.tool()
async def delete_task(project_id: str, task_id: str) -> Dict[str, str]:
    """Elimina una tarea"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.delete(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks/{task_id}", headers=headers)
    response.raise_for_status()
    return {"message": "Task deleted successfully"}

# ==================== NOTE ENDPOINTS ====================

@mcp.tool()
async def get_notes_by_task(project_id: str, task_id: str) -> List[Note]:
    """Obtiene todas las notas de una tarea"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.get(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks/{task_id}/notes", headers=headers)
    response.raise_for_status()
    notes_data = response.json()
    return [Note(**note) for note in notes_data]

@mcp.tool()
async def create_note(project_id: str, task_id: str, content: str) -> Note:
    """Crea una nueva nota en una tarea"""
    client = await get_http_client()
    headers = await get_auth_headers()
    payload = {"content": content}
    response = await client.post(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks/{task_id}/notes", json=payload, headers=headers)
    response.raise_for_status()
    note_data = response.json()
    return Note(**note_data)

@mcp.tool()
async def delete_note(project_id: str, task_id: str, note_id: str) -> Dict[str, str]:
    """Elimina una nota"""
    client = await get_http_client()
    headers = await get_auth_headers()
    response = await client.delete(f"{API_GATEWAY_URL}/api/projects/{project_id}/tasks/{task_id}/notes/{note_id}", headers=headers)
    response.raise_for_status()
    return {"message": "Note deleted successfully"}

if __name__ == "__main__":
    mcp.run()