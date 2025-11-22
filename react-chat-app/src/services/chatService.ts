const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ChatResponse {
  response: string;
  timestamp?: string;
}

export const sendMessage = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};

export const checkHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

export const formatMessage = (message: string, sender: 'user' | 'ai'): { content: string; sender: 'user' | 'ai' } => {
  return {
    content: message,
    sender,
  };
};