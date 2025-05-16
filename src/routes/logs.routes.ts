import express from 'express';
import { getUserLogs, getLogsByAction, getLogsAnalytics, getUserActivityStats } from '../controllers/log.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { Permission } from '../types/permission';
import { logValidation } from '../utils/validation.rules';

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Kullanıcı faaliyetlerini ve sistem loglarını görüntüleme
 */

const router = express.Router();

// Tüm rotalar için kimlik doğrulama gereklidir
router.use(authenticate);

/**
 * @swagger
 * /logs/users/{userId}:
 *   get:
 *     summary: Belirli bir kullanıcının log kayıtlarını getirir
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Kullanıcı ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Başlangıç tarihi (GG/AA/YYYY)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Bitiş tarihi (GG/AA/YYYY)
 *     responses:
 *       200:
 *         description: Kullanıcı logları başarıyla getirildi
 */
router.get('/users/:userId', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getUserLogs), 
  getUserLogs
);

/**
 * @swagger
 * /logs/my-logs:
 *   get:
 *     summary: Oturum açmış kullanıcının log kayıtlarını getirir
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Kullanıcı logları başarıyla getirildi
 */
router.get('/my-logs', 
  validate(logValidation.getUserLogs), 
  getUserLogs
);

/**
 * @swagger
 * /logs/actions/{action}:
 *   get:
 *     summary: Belirli bir eylem tipine ait logları getirir
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: action
 *         schema:
 *           type: string
 *         required: true
 *         description: Log eylem tipi
 *     responses:
 *       200:
 *         description: Eylem logları başarıyla getirildi
 */
router.get('/actions/:action', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getLogsByAction), 
  getLogsByAction
);

/**
 * @swagger
 * /logs/analytics:
 *   get:
 *     summary: Log analizlerini getirir
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Log analizleri başarıyla getirildi
 */
router.get('/analytics', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getAnalytics), 
  getLogsAnalytics
);

/**
 * @swagger
 * /logs/users/{userId}/activity:
 *   get:
 *     summary: Kullanıcı aktivite istatistiklerini getirir
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı aktivite istatistikleri başarıyla getirildi
 */
router.get('/users/:userId/activity', 
  requirePermission(Permission.VIEW_LOGS), 
  validate(logValidation.getUserActivityStats), 
  getUserActivityStats
);

/**
 * @swagger
 * /logs/my-activity:
 *   get:
 *     summary: Oturum açmış kullanıcının aktivite istatistiklerini getirir
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Kullanıcı aktivite istatistikleri başarıyla getirildi
 */
router.get('/my-activity', 
  validate(logValidation.getUserActivityStats), 
  getUserActivityStats
);

export default router; 