import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from .client import execute_query

# Cargar variables de entorno desde .env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

async def main():
    # Verificar que existe la API key
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ Error: GOOGLE_API_KEY no encontrada")
        print("   Asegúrate de tener un archivo .env con:")
        print("   GOOGLE_API_KEY=tu_clave_aqui")
        return
    
    print("🤖 Agente de Gestión de Tareas con Gemini")
    print("Conectando con microservicio task-service...\n")
    
    while True:
        query = input("💬 ¿Qué quieres hacer? (o 'salir' para terminar): ")
        
        if query.lower() in ['salir', 'exit', 'quit']:
            print("👋 ¡Hasta luego!")
            break
        
        if not query.strip():
            continue
            
        try:
            await execute_query(query)
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print()  # Línea en blanco

if __name__ == "__main__":
    asyncio.run(main())