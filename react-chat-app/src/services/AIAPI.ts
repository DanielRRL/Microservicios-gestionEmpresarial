import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tipos
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  response: string;
  success: boolean;
  error: string | null;
};

// API del agente IA
export async function sendMessageToAI(message: string): Promise<ChatResponse> {
  try {
    const { data } = await api.post<ChatResponse>('/ai/chat', {
      message
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al comunicarse con el agente');
    }
    throw new Error('Error de conexión con el agente IA');
  }
}

export async function checkAIHealth() {
  try {
    const { data } = await api.get('/ai/health');
    return data;
  } catch (error) {
    throw new Error('El agente IA no está disponible');
  }
}
