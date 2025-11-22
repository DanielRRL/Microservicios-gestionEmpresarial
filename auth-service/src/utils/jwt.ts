import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export class JWTService {
  private static readonly SECRET = process.env.JWT_SECRET!;
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

  static generate(payload: JWTPayload): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN
    } as jwt.SignOptions);
  }

  static verify(token: string): JWTPayload {
    return jwt.verify(token, this.SECRET) as JWTPayload;
  }
}
