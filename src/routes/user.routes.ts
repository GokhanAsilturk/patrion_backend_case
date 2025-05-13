import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Kimlik doğrulama gerektiren rotalar
router.get('/profile', authenticate, userController.getProfile);

// Sadece admin kullanıcılarının erişebileceği rotalar
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

export default router; 