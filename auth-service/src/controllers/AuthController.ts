import { Response } from 'express';
import { AuthRequest, UserResponse } from '../types';
import { UserModel } from '../models/User';
import { TokenModel } from '../models/Token';
import { JWTService } from '../utils/jwt';
import { EmailService } from '../utils/email';

export class AuthController {
  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
        return;
      }
      
      const isValidPassword = await UserModel.verifyPassword(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
        return;
      }
      
      if (!user.is_active) {
        res.status(401).json({ error: 'Usuario inactivo. Contacta al administrador' });
        return;
      }
      
      const token = JWTService.generate({ id: user.id, role: user.role });
      
      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      res.json({ token, user: userResponse });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'El email ya está registrado' });
        return;
      }
      
      const user = await UserModel.create({ name, email, password, role });
      
      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: userResponse
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  
  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      
      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      res.json(userResponse);
    } catch (error) {
      console.error('Error in getMe:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  
  static async validateToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ valid: false });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      
      if (!user || !user.is_active) {
        res.status(401).json({ valid: false });
        return;
      }
      
      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      res.json({
        valid: true,
        user: userResponse
      });
    } catch (error) {
      console.error('Error in validateToken:', error);
      res.status(401).json({ valid: false });
    }
  }
  
  static async forgotPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      const user = await UserModel.findByEmail(email);
      
      // Por seguridad, siempre retornamos el mismo mensaje
      const successMessage = 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña';
      
      if (!user) {
        res.json({ message: successMessage });
        return;
      }
      
      const token = await TokenModel.create(user.id, 'passwordReset');
      
      await EmailService.sendPasswordReset(user.email, token);
      
      res.json({ message: successMessage });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  
  static async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      const validToken = await TokenModel.findValid(token, 'passwordReset');
      
      if (!validToken) {
        res.status(400).json({ error: 'Token inválido o expirado' });
        return;
      }
      
      await UserModel.updatePassword(validToken.user_id, password);
      await TokenModel.delete(token);
      
      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  
  static async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      
      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      res.json({ user: userResponse });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
  
  static async listUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await UserModel.getAll();
      
      const usersResponse: UserResponse[] = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }));
      
      res.json(usersResponse);
    } catch (error) {
      console.error('Error in listUsers:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Obtener usuario actual con password
      const user = await UserModel.findByIdWithPassword(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Verificar contraseña actual
      const isValidPassword = await UserModel.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Contraseña actual incorrecta' });
        return;
      }

      // Actualizar contraseña
      await UserModel.updatePassword(user.id, newPassword);

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error in changePassword:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
}
