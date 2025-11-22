#!/usr/bin/env python3
"""
Script de prueba para verificar que la API funciona correctamente
"""
import asyncio
import httpx
import sys

API_BASE_URL = "http://localhost:8000"

async def test_health():
    """Prueba el endpoint de health"""
    print("🔍 Probando health check...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{API_BASE_URL}/api/health")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check OK")
                print(f"   Status: {data['status']}")
                print(f"   Message: {data['message']}")
                print(f"   API Key configurada: {data['api_key_configured']}")
                return True
            else:
                print(f"❌ Error: Status code {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Error conectando con la API: {e}")
        print("   ¿Está el servidor ejecutándose en puerto 8000?")
        return False

async def test_chat(message: str):
    """Prueba el endpoint de chat"""
    print(f"\n💬 Probando chat con mensaje: '{message}'")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{API_BASE_URL}/api/chat",
                json={"message": message}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Respuesta recibida")
                print(f"   Success: {data['success']}")
                print(f"   Response: {data['response'][:200]}...")  # Primeros 200 chars
                return True
            else:
                print(f"❌ Error: Status code {response.status_code}")
                print(f"   {response.text}")
                return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("🧪 Test de API REST del Agente IA")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = await test_health()
    
    if not health_ok:
        print("\n⚠️  No se puede continuar sin conexión a la API")
        sys.exit(1)
    
    # Test 2: Chat simple
    await asyncio.sleep(1)  # Pequeña pausa
    chat_ok = await test_chat("Muéstrame todos los proyectos")
    
    print("\n" + "=" * 50)
    if health_ok and chat_ok:
        print("✅ Todos los tests pasaron correctamente")
    else:
        print("⚠️  Algunos tests fallaron")

if __name__ == "__main__":
    asyncio.run(main())
