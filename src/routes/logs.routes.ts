import express from 'express';
import { getUserLogs, getLogsByAction, getLogsAnalytics, getUserActivityStats } from '../controllers/log.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { Permission } from '../types/permission';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gereklidir
router.use(authenticate);

// Tüm kullanıcı log kayıtlarını getir
router.get('/users/:userId', requirePermission(Permission.VIEW_LOGS), getUserLogs);

// Oturum açmış kullanıcının kendi log kayıtlarını getir
router.get('/my-logs', getUserLogs);

// Belirli bir eylem tipi için log kayıtlarını getir
router.get('/actions/:action', requirePermission(Permission.VIEW_LOGS), getLogsByAction);

// Log analizlerini getir
router.get('/analytics', requirePermission(Permission.VIEW_LOGS), getLogsAnalytics);

// Kullanıcı aktivite istatistiklerini getir
router.get('/users/:userId/activity', requirePermission(Permission.VIEW_LOGS), getUserActivityStats);

// Oturum açmış kullanıcının kendi aktivite istatistiklerini getir
router.get('/my-activity', getUserActivityStats);

export default router; 