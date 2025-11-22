import pool from '../config/database';
import { User, CreateUserDTO } from '../types';
import { HashService } from '../utils/hash';

export class UserModel {
  static async create(data: CreateUserDTO): Promise<User> {
    const hashedPassword = await HashService.hash(data.password);
    
    const result = await pool.query<User>(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [data.name, data.email, hashedPassword, data.role || 'user']
    );
    
    return result.rows[0];
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }
  
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async findByIdWithPassword(id: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  static async getAll(): Promise<User[]> {
    const result = await pool.query<User>(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    return result.rows;
  }
  
  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await HashService.hash(newPassword);
    
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return HashService.compare(plainPassword, hashedPassword);
  }
}
