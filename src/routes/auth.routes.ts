import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validator.middleware';
import { authValidation } from '../utils/validation.rules';
import { strictRateLimiter } from '../middlewares/rate-limiter.middleware';

const router = Router();

// Kullanıcı kaydı
router.post('/register', strictRateLimiter, validate(authValidation.register), authController.register);

// Kullanıcı girişi
router.post('/login', strictRateLimiter, validate(authValidation.login), authController.login);

export default router; 