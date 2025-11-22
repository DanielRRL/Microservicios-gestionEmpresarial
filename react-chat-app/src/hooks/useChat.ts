import { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../services/chatService';
import { Message } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToAI = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { 
      id: Date.now().toString(),
      content, 
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const aiResponse = await sendMessage(content);
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(),
        content: aiResponse.response, 
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message to AI:', err);
      setError('No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo.');
      
      // Mensaje de error en el chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage: sendMessageToAI, loading, error, messagesEndRef };
};

export default useChat;