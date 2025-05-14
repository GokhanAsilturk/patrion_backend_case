import express from 'express';
import { getUserLogs, getLogsByAction, getLogsAnalytics, getUserActivityStats } from '../controllers/log.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { Permission } from '../types/permission';
import { logValidation } from '../utils/validation.rules';

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gereklidir
router.use(authenticate);

// Tüm kullanıcı log kayıtlarını getir
router.get('/users/:userId', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getUserLogs), 
  getUserLogs
);

// Oturum açmış kullanıcının kendi log kayıtlarını getir
router.get('/my-logs', 
  validate(logValidation.getUserLogs), 
  getUserLogs
);

// Belirli bir eylem tipi için log kayıtlarını getir
router.get('/actions/:action', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getLogsByAction), 
  getLogsByAction
);

// Log analizlerini getir
router.get('/analytics', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getAnalytics), 
  getLogsAnalytics
);

// Kullanıcı aktivite istatistiklerini getir
router.get('/users/:userId/activity', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getUserActivityStats), 
  getUserActivityStats
);

// Oturum açmış kullanıcının kendi aktivite istatistiklerini getir
router.get('/my-activity', 
  validate(logValidation.getUserActivityStats), 
  getUserActivityStats
);

export default router; 