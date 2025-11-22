"""
Sistema de autenticación del agente IA.
Genera y mantiene tokens JWT para autenticarse como admin.
"""
import os
import httpx
from typing import Optional
from datetime import datetime, timedelta

class AgentAuth:
    """Maneja la autenticación del agente como admin"""
    
    def __init__(self):
        self.token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None
        self.api_gateway_url = os.getenv("API_GATEWAY_URL", "http://api-gateway:4000")
        self.admin_email = os.getenv("ADMIN_EMAIL", "admin@test.com")
        self.admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
    async def get_token(self) -> str:
        """
        Obtiene un token JWT válido.
        Si el token actual es válido, lo retorna.
        Si no existe o expiró, solicita uno nuevo.
        """
        # Si tenemos token y aún es válido, retornarlo
        if self.token and self.token_expires_at:
            if datetime.now() < self.token_expires_at - timedelta(minutes=5):
                return self.token
        
        # Necesitamos un nuevo token
        await self._login()
        return self.token
    
    async def _login(self):
        """Realiza login como admin y obtiene JWT"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.api_gateway_url}/api/auth/login",
                    json={
                        "email": self.admin_email,
                        "password": self.admin_password
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                
                data = response.json()
                self.token = data.get("token")
                
                # JWT expira en 24 horas por defecto
                # Guardamos el tiempo de expiración
                self.token_expires_at = datetime.now() + timedelta(hours=23)
                
            except httpx.HTTPError as e:
                raise Exception(f"Error autenticando agente: {str(e)}")
    
    def get_auth_headers(self) -> dict:
        """Retorna headers con el token de autorización"""
        if not self.token:
            raise Exception("No hay token disponible. Llama a get_token() primero.")
        
        return {
            "Authorization": f"Bearer {self.token}"
        }

# Instancia global del sistema de autenticación
_auth_instance: Optional[AgentAuth] = None

def get_auth() -> AgentAuth:
    """Obtiene la instancia global de autenticación"""
    global _auth_instance
    if _auth_instance is None:
        _auth_instance = AgentAuth()
    return _auth_instance
