import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class HashService {
  static async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  static async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}
