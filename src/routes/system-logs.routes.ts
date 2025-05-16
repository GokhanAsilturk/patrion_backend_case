import express from 'express';
import { getSystemLogs, getAvailableLogFiles } from '../controllers/system-log.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/user';

/**
 * @swagger
 * tags:
 *   name: System Logs
 *   description: Sistem log dosyalarının yönetimi
 */
const router = express.Router();

// Tüm rotalar için kimlik doğrulama ve yetkilendirme gereklidir (sadece System Admin)
router.use(authenticate);
router.use(authorize([UserRole.SYSTEM_ADMIN]));

// Sistem log dosyalarını getir
router.get('/', getSystemLogs);

// Kullanılabilir log dosyalarını listele
router.get('/available', getAvailableLogFiles);

export default router; 