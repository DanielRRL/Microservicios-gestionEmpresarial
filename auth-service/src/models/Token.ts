import pool from '../config/database';
import { Token } from '../types';
import crypto from 'crypto';

export class TokenModel {
  private static readonly TOKEN_EXPIRY_MINUTES = 10;

  static async create(userId: string, type: 'passwordReset'): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);
    
    await pool.query(
      `INSERT INTO tokens (token, user_id, type, expires_at) 
       VALUES ($1, $2, $3, $4)`,
      [token, userId, type, expiresAt]
    );
    
    return token;
  }
  
  static async findValid(token: string, type: string): Promise<Token | null> {
    const result = await pool.query<Token>(
      `SELECT * FROM tokens 
       WHERE token = $1 AND type = $2 AND expires_at > NOW()`,
      [token, type]
    );
    
    return result.rows[0] || null;
  }
  
  static async delete(token: string): Promise<void> {
    await pool.query('DELETE FROM tokens WHERE token = $1', [token]);
  }
  
  static async cleanExpired(): Promise<void> {
    await pool.query('DELETE FROM tokens WHERE expires_at < NOW()');
  }
}
