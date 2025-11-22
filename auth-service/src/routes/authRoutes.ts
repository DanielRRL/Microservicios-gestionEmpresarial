import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/role';
import {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation
} from '../middleware/validation';

const router = Router();

// Public routes
router.post('/login', loginValidation, AuthController.login);
router.post('/forgot-password', forgotPasswordValidation, AuthController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, AuthController.resetPassword);

// Protected routes
router.get('/me', authenticate, AuthController.getMe);
router.post('/validate', authenticate, AuthController.validateToken);
router.get('/users/:userId', authenticate, AuthController.getUserById);
router.put('/change-password', authenticate, changePasswordValidation, AuthController.changePassword);

// Admin only routes
router.get('/users', authenticate, isAdmin, AuthController.listUsers);
router.post('/register', authenticate, isAdmin, registerValidation, AuthController.register);

export default router;
