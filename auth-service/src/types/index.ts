import { Request } from 'express';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface LoginDTO {
  email: string;
  password: string;
}

// Token types
export interface Token {
  id: string;
  token: string;
  user_id: string;
  type: 'passwordReset';
  expires_at: Date;
  created_at: Date;
}

export interface JWTPayload {
  id: string;
  role: 'admin' | 'user';
}

// Request extensions
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
