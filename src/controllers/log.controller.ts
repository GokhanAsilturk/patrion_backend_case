import { Response } from 'express';
import { createUserLog, getUserLogsByUserId, getUserLogsByAction, getLogAnalytics } from '../models/log.model';
import { LogAction } from '../types/log';
import { UserRole } from '../types/user';
import pool from '../config/database';
import { AuthRequest } from '../types/auth';

/**
 * Kullanıcı log kayıtlarını listeler
 * Sistem admin: Tüm logları görebilir
 * Şirket admin: Kendi şirketindeki kullanıcıların loglarını görebilir
 * Kullanıcı: Sadece kendi loglarını görebilir
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
 * Belirli bir eylem tipi için log kayıtlarını listeler
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
 * Log analizlerini getirir
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
 * Kullanıcı davranış takibi için istatistikleri getirir
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