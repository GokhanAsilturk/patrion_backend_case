import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { Permission } from '../types/permission';
import { UserRole } from '../types/user';
import { userValidation } from '../utils/validation.rules';
import { logUserProfileView } from '../middlewares/log-tracker.middleware';

const router = Router();

// Kimlik doğrulama gerektiren rotalar
router.get('/profile', authenticate, logUserProfileView, userController.getProfile);

// Sadece admin kullanıcılarının erişebileceği rotalar
router.get('/', authenticate, authorize([UserRole.SYSTEM_ADMIN]), userController.getAllUsers);

// Kullanıcı adına göre kullanıcı getirme
router.get('/username/:username', 
  authenticate, 
  authorize([UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN]), 
  validate(userValidation.getByUsername), 
  logUserProfileView,
  userController.getUserByUsername
);

// ID'ye göre kullanıcı getirme - Bunu en sona alıyoruz çünkü "/:id" tüm parametreleri yakalayabilir
router.get('/:id', 
  authenticate, 
  authorize([UserRole.SYSTEM_ADMIN, UserRole.COMPANY_ADMIN]), 
  validate(userValidation.getById), 
  logUserProfileView,
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