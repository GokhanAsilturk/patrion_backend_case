import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { createUserLog } from '../models/log.model';
import { LogAction } from '../types/log';

/**
 * Kullanıcı sayfa ziyaretlerini ve aktivitelerini otomatik olarak loglar
 * Bu middleware, kullanıcı belirli sayfalara eriştiğinde log kaydı oluşturur
 */
export const logUserActivity = (action: LogAction, detailsProvider?: (req: AuthRequest) => Record<string, any>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Kullanıcı kimliği kontrolü
      if (!req.user || !req.user.id) {
        // Kimlik doğrulama yapılmamış, middleware'i atlayıp devam et
        return next();
      }

      // Detayları hazırla (eğer detay sağlayıcı fonksiyon verilmişse)
      const details = detailsProvider ? detailsProvider(req) : {};

      // Log kaydı oluştur
      await createUserLog({
        user_id: req.user.id,
        action,
        details,
        ip_address: req.ip
      });

      // Sonraki middleware'e devam et
      next();
    } catch (error) {
      // Hata durumunda, loglama işlemi başarısız olsa bile uygulamanın çalışmaya devam etmesini sağla
      console.error('Kullanıcı aktivitesi loglanırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
      next();
    }
  };
};

/**
 * Sensör verilerini görüntüleme erişimini loglar
 */
export const logSensorDataView = logUserActivity(LogAction.VIEWED_SENSOR_DATA, (req) => ({
  sensor_id: req.params.sensorId || req.params.sensor_id,
  query_params: req.query
}));

/**
 * Kullanıcı profilini görüntüleme erişimini loglar
 */
export const logUserProfileView = logUserActivity(LogAction.VIEWED_USER_PROFILE, (req) => ({
  target_user_id: req.params.userId || req.params.id
}));

/**
 * Şirket verisi görüntüleme erişimini loglar
 */
export const logCompanyDataView = logUserActivity(LogAction.VIEWED_COMPANY_DATA, (req) => ({
  company_id: req.params.companyId || req.params.id
}));

/**
 * Veri dışa aktarma işlemini loglar
 */
export const logDataExport = logUserActivity(LogAction.EXPORTED_DATA, (req) => ({
  export_type: req.query.type || 'default',
  format: req.query.format || 'json'
}));

/**
 * Veri raporu indirme işlemini loglar
 */
export const logReportDownload = logUserActivity(LogAction.DOWNLOADED_REPORT, (req) => ({
  report_id: req.params.reportId,
  report_type: req.query.type
})); 