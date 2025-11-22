# Agente IA con Gemini 🤖

API REST para gestión de proyectos y tareas usando Gemini 2.0 Flash.

## 🚀 Inicio Rápido con Docker

El agente se inicia automáticamente con docker-compose:

```bash
# Desde la raíz del proyecto
docker-compose up -d ai-agent
```

La API estará disponible en: **http://localhost:8000**

### Variables de Entorno

Configuradas en `/.env`:
```bash
GOOGLE_API_KEY=tu_clave_aqui
```

## 📡 API Endpoints

### POST /api/chat
Envía mensajes al agente IA.

**Request:**
```json
{
  "message": "Muéstrame todos los proyectos"
}
```

**Response:**
```json
{
  "response": "Aquí están los proyectos...",
  "success": true,
  "error": null
}
```

### GET /api/health
Verifica el estado del servicio.

**Response:**
```json
{
  "status": "ok",
  "message": "Agente IA funcionando correctamente",
  "api_key_configured": true
}
```

## 🎨 Conectar Frontend React

### 1. Crear servicio de chat

```typescript
// src/services/chatService.ts
const API_URL = 'http://localhost:8000';

export const sendMessage = async (message: string) => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  return response.json();
};

export const checkHealth = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  return response.json();
};
```

### 2. Usar en componente

```tsx
// src/components/Chat.tsx
import { useState } from 'react';
import { sendMessage } from '../services/chatService';

export const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const data = await sendMessage(input);
      
      setMessages(prev => [...prev, 
        { text: input, isUser: true },
        { text: data.response, isUser: false }
      ]);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.isUser ? 'user' : 'bot'}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Escribe un mensaje..."
      />
      
      <button onClick={handleSend} disabled={loading}>
        Enviar
      </button>
    </div>
  );
};
```

## 💬 Ejemplos de Consultas

- `"Muéstrame todos los proyectos"`
- `"Crea un proyecto llamado 'Mi App Web'"`
- `"Agrega una tarea 'Diseño del logo' al proyecto abc123"`
- `"Cambia el estado de la tarea xyz456 a completada"`
- `"Muéstrame las notas de la tarea task123"`

## 🧪 Probar API

```bash
# Health check
curl http://localhost:8000/api/health

# Enviar mensaje
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Muéstrame todos los proyectos"}'

# Documentación interactiva
# http://localhost:8000/docs
```

## 🏗️ Arquitectura

```
Frontend React (Puerto 5173)
         ↓
API REST FastAPI (Puerto 8000)
         ↓
Agente IA Gemini
         ↓
Task Service (Puerto 3000)
```

## ⚠️ Requisitos

1. **GOOGLE_API_KEY** configurada en `/.env`
2. **Task Service** ejecutándose en contenedor Docker
3. **Docker** y **docker-compose** instalados

## 🛠️ Comandos Útiles

```bash
# Verificar estado del agente
docker-compose ps ai-agent

# Ver logs
docker-compose logs -f ai-agent

# Reiniciar agente
docker-compose restart ai-agent

# Detener agente
docker-compose stop ai-agent

# Health check
curl http://localhost:8000/api/health

# Enviar mensaje
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Muéstrame todos los proyectos"}'
```

## 📚 Documentación

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
