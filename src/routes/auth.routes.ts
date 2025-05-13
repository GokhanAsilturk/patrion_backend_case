import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Kullanıcı kaydı
router.post('/register', authController.register);

// Kullanıcı girişi
router.post('/login', authController.login);

export default router; 