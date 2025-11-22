export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  clientName: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NavigationRoute = 'chat' | 'admin' | 'proyectos' | 'inventario' | 'usuarios' | 'perfil';