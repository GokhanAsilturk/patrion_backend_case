import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { Permission } from '../types/permission';
import { UserRole } from '../types/user';
import { userValidation } from '../utils/validation.rules';

const router = Router();

// Kimlik doğrulama gerektiren rotalar
router.get('/profile', authenticate, userController.getProfile);

// Sadece admin kullanıcılarının erişebileceği rotalar
router.get('/', authenticate, authorize([UserRole.SYSTEM_ADMIN]), userController.getAllUsers);

// ID'ye göre kullanıcı getirme
router.get('/:id', 
  authenticate, 
  authorize([UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN]), 
  validate(userValidation.getById), 
  userController.getUserById
);

// Kullanıcı bilgilerini güncelleme
router.put('/:id', 
  authenticate, 
  authorize([UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN]), 
  validate(userValidation.update), 
  userController.updateUser
);

// Alternatif olarak izin tabanlı yetkilendirme de kullanılabilir
// router.get('/', authenticate, requirePermission(Permission.VIEW_USERS), userController.getAllUsers);

export default router; 