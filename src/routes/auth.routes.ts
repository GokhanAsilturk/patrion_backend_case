import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validator.middleware';
import { authValidation } from '../utils/validation.rules';

const router = Router();

// Kullanıcı kaydı
router.post('/register', validate(authValidation.register), authController.register);

// Kullanıcı girişi
router.post('/login', validate(authValidation.login), authController.login);

export default router; 