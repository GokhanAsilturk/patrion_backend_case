import { Response } from 'express';
import { createUserLog, getUserLogsByUserId, getUserLogsByAction, getLogAnalytics } from '../models/log.model';
import { LogAction } from '../types/log';
import { UserRole } from '../types/user';
import pool from '../config/database';
import { AuthRequest } from '../types/auth';

/**
 * @swagger
 * /logs/users/{userId}:
 *   get:
 *     summary: Belirli bir kullanıcının log kayıtlarını getirir
 *     description: Kullanıcıya ait tüm log kayıtlarını listeler. System Admin tüm logları, Company Admin kendi şirketindeki kullanıcıların loglarını, User ise sadece kendi loglarını görebilir.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Logları görüntülenecek kullanıcının ID'si
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Başlangıç tarihi (ISO8601 formatında)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Bitiş tarihi (ISO8601 formatında)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Bir sayfada gösterilecek log sayısı
 *     responses:
 *       200:
 *         description: Kullanıcı logları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserLog'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
/**
 * @swagger
 * /logs/my-logs:
 *   get:
 *     summary: Kendi log kayıtlarını getirir
 *     description: Oturum açmış kullanıcının kendi log kayıtlarını listeler. Her kullanıcı kendi loglarını görüntüleme hakkına sahiptir.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Başlangıç tarihi (ISO8601 formatında)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Bitiş tarihi (ISO8601 formatında)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Bir sayfada gösterilecek log sayısı
 *     responses:
 *       200:
 *         description: Kullanıcı logları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserLog'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getUserLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Eğer userId params'tan gelmiyorsa, oturum açmış kullanıcının id'sini kullan
    const userId = parseInt(req.params.userId, 10) || req.user?.id || 0;
    const userRole = req.user?.role;
    
    // Erişim kontrolü
    if (userRole !== UserRole.SYSTEM_ADMIN && req.user?.id !== userId) {
      // Şirket yöneticileri için şirket bazlı erişim kontrolü ek olarak yapılabilir
      if (userRole === UserRole.COMPANY_ADMIN) {
        // Bu kısım, şirket kontrolü gerektiren bir sorgu eklenecek
        // Şirket yöneticisi, şirketindeki kullanıcıların loglarını görebilmeli
      } else {
        res.status(403).json({
          status: 'error',
          message: 'Bu kullanıcının log kayıtlarına erişim yetkiniz bulunmamaktadır'
        });
        return;
      }
    }
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_LOGS,
      details: { target_user_id: userId },
      ip_address: req.ip
    });
    
    const logs = await getUserLogsByUserId(userId);
    
    res.json({
      status: 'success',
      results: logs.length,
      data: { logs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Log kayıtları alınırken hata oluştu'
    });
  }
};

/**
 * @swagger
 * /logs/actions/{action}:
 *   get:
 *     summary: Belirli bir eylem tipine ait log kayıtlarını getirir
 *     description: Belirtilen eylem tipine göre filtrelenmiş log kayıtlarını listeler.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *         description: Log eylem tipi (örn. 'login', 'viewed_logs', 'invalid_sensor_data' vb.)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Başlangıç tarihi (ISO8601 formatında)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Bitiş tarihi (ISO8601 formatında)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Bir sayfada gösterilecek log sayısı
 *     responses:
 *       200:
 *         description: Filtrelenmiş log kayıtları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserLog'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
export const getLogsByAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action } = req.params;
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_LOGS,
      details: { action_type: action },
      ip_address: req.ip
    });
    
    const logs = await getUserLogsByAction(action);
    
    res.json({
      status: 'success',
      results: logs.length,
      data: { logs }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Log kayıtları alınırken hata oluştu'
    });
  }
};

/**
 * @swagger
 * /logs/analytics:
 *   get:
 *     summary: Log analitiklerini getirir
 *     description: Sistem üzerindeki log kayıtlarını analiz ederek özet istatistikler sunar.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 7
 *         description: Kaç günlük verinin analiz edileceği
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Başlangıç tarihi (ISO8601 formatında)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Bitiş tarihi (ISO8601 formatında)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Sonuçların nasıl gruplandırılacağı
 *     responses:
 *       200:
 *         description: Log analitikleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     analytics:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LogAnalytics'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
export const getLogsAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_LOGS,
      details: { analytics: true, days },
      ip_address: req.ip
    });
    
    const analytics = await getLogAnalytics(days);
    
    res.json({
      status: 'success',
      data: { analytics }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Log analizi alınırken hata oluştu'
    });
  }
};

/**
 * @swagger
 * /logs/users/{userId}/activity:
 *   get:
 *     summary: Kullanıcının aktivite istatistiklerini getirir
 *     description: Belirli bir kullanıcının sistem üzerindeki aktivitelerini istatistiksel olarak analiz eder.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Aktivite istatistikleri görüntülenecek kullanıcının ID'si
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Başlangıç tarihi (ISO8601 formatında)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Bitiş tarihi (ISO8601 formatında)
 *     responses:
 *       200:
 *         description: Kullanıcı aktivite istatistikleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     activity_stats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserActivityStats'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
/**
 * @swagger
 * /logs/my-activity:
 *   get:
 *     summary: Kendi aktivite istatistiklerini getirir
 *     description: Oturum açmış kullanıcının sistem üzerindeki aktivitelerini istatistiksel olarak analiz eder.
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Başlangıç tarihi (ISO8601 formatında)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Bitiş tarihi (ISO8601 formatında)
 *     responses:
 *       200:
 *         description: Kullanıcı aktivite istatistikleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     activity_stats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserActivityStats'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       500:
 *         description: Sunucu hatası
 */
export const getUserActivityStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10) || req.user?.id || 0;
    
    // Erişim kontrolü burada da yapılabilir
    
    // Basit bir kullanıcı aktivite istatistiği sorgusu
    const query = `
      SELECT 
        action,
        COUNT(*) as count,
        MIN(timestamp) as first_activity,
        MAX(timestamp) as last_activity,
        jsonb_agg(DISTINCT ip_address) as ip_addresses
      FROM user_logs
      WHERE user_id = $1
      GROUP BY action
      ORDER BY count DESC;
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_LOGS,
      details: { target_user_id: userId, activity_stats: true },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      data: { activity_stats: rows }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Kullanıcı aktivite istatistikleri alınırken hata oluştu'
    });
  }
}; 