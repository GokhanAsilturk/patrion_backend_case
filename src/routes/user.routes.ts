import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.middleware';
import { Permission } from '../types/permission';
import { UserRole } from '../types/user';

const router = Router();

// Kimlik doğrulama gerektiren rotalar
router.get('/profile', authenticate, userController.getProfile);

// Sadece admin kullanıcılarının erişebileceği rotalar
router.get('/', authenticate, authorize([UserRole.SYSTEM_ADMIN]), userController.getAllUsers);

// Alternatif olarak izin tabanlı yetkilendirme de kullanılabilir
// router.get('/', authenticate, requirePermission(Permission.VIEW_USERS), userController.getAllUsers);

export default router; 