import { Response } from 'express';
import { getSensorBySensorId } from '../models/sensor.model';
import { AuthRequest } from '../types/auth';
import { createUserLog } from '../models/log.model';
import { LogAction } from '../types/log';
import { querySensorData, queryAggregatedData } from '../services/influxdb.service';
import { parseLocalDate } from '../utils/date-utils';
import { publishSensorData, io } from '../socket';

export const getSensorTimeseriesData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    
    // Sensörün var olup olmadığını kontrol et
    const sensor = await getSensorBySensorId(sensorId);
    if (!sensor) {
      res.status(404).json({
        status: 'error',
        message: 'Sensör bulunamadı'
      });
      return;
    }
    
    // Zaman aralığı parametrelerini al ve işle
    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;
    
    // Varsayılan tarihler: son 24 saat
    const now = Math.floor(Date.now() / 1000); // Unix timestamp (saniye)
    const oneDayAgo = now - (24 * 60 * 60); // 24 saat öncesi
    
    // Eğer tarih parametreleri varsa, parse et
    let startTimestamp = oneDayAgo;
    let endTimestamp = now;
    
    if (startDateStr) {
      const startDate = parseLocalDate(startDateStr);
      if (startDate) {
        startTimestamp = Math.floor(startDate.getTime() / 1000);
      }
    }
    
    if (endDateStr) {
      const endDate = parseLocalDate(endDateStr);
      if (endDate) {
        // Günün sonunu kullan (23:59:59)
        endDate.setHours(23, 59, 59, 999);
        endTimestamp = Math.floor(endDate.getTime() / 1000);
      }
    }
    
    // InfluxDB'den zaman serisi verilerini sorgula
    const timeseriesData = await querySensorData(sensorId, startTimestamp, endTimestamp);
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_SENSOR_DATA,
      details: { 
        sensor_id: sensorId,
        start_timestamp: startTimestamp,
        end_timestamp: endTimestamp
      },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      data: {
        sensor_id: sensorId,
        start_time: startTimestamp,
        end_time: endTimestamp,
        readings: timeseriesData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Sensör verileri alınırken hata oluştu'
    });
  }
};

export const getSensorAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const field = req.query.field as string;
    const window = req.query.window as string || '1h';
    
    if (!field) {
      res.status(400).json({
        status: 'error',
        message: 'Analiz edilecek alanı (field) belirtmelisiniz'
      });
      return;
    }
    
    // Sensörün var olup olmadığını kontrol et
    const sensor = await getSensorBySensorId(sensorId);
    if (!sensor) {
      res.status(404).json({
        status: 'error',
        message: 'Sensör bulunamadı'
      });
      return;
    }
    
    // Zaman aralığı parametrelerini al ve işle
    const startDateStr = req.query.startDate as string;
    const endDateStr = req.query.endDate as string;
    
    // Varsayılan tarihler: son 24 saat
    const now = Math.floor(Date.now() / 1000); // Unix timestamp (saniye)
    const oneDayAgo = now - (24 * 60 * 60); // 24 saat öncesi
    
    // Eğer tarih parametreleri varsa, parse et
    let startTimestamp = oneDayAgo;
    let endTimestamp = now;
    
    if (startDateStr) {
      const startDate = parseLocalDate(startDateStr);
      if (startDate) {
        startTimestamp = Math.floor(startDate.getTime() / 1000);
      }
    }
    
    if (endDateStr) {
      const endDate = parseLocalDate(endDateStr);
      if (endDate) {
        // Günün sonunu kullan (23:59:59)
        endDate.setHours(23, 59, 59, 999);
        endTimestamp = Math.floor(endDate.getTime() / 1000);
      }
    }
    
    // InfluxDB'den analitik verileri sorgula
    const analyticsData = await queryAggregatedData(sensorId, field, window, startTimestamp, endTimestamp);
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_SENSOR_DATA,
      details: { 
        sensor_id: sensorId,
        field,
        window,
        start_timestamp: startTimestamp,
        end_timestamp: endTimestamp
      },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      data: {
        sensor_id: sensorId,
        field,
        window,
        start_time: startTimestamp,
        end_time: endTimestamp,
        analytics: analyticsData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Sensör analitik verileri alınırken hata oluştu'
    });
  }
};

export const publishSensorDataManually = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { readings, companyId } = req.body;
    
    if (!readings) {
      res.status(400).json({
        status: 'error',
        message: 'Sensör okuma verileri (readings) gereklidir'
      });
      return;
    }
    
    // Sensörün var olup olmadığını kontrol et
    const sensor = await getSensorBySensorId(sensorId);
    if (!sensor) {
      res.status(404).json({
        status: 'error',
        message: 'Sensör bulunamadı'
      });
      return;
    }
    
    // Socket.IO ile veriyi yayınla
    const published = publishSensorData(sensorId, { 
      ...readings, 
      timestamp: readings.timestamp || new Date().toISOString() 
    }, companyId || sensor.company_id);
    
    if (!published) {
      res.status(500).json({
        status: 'error',
        message: 'Socket.IO henüz başlatılmadı veya bağlantı problemi var'
      });
      return;
    }
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.PUBLISHED_SENSOR_DATA,
      details: { 
        sensor_id: sensorId,
        company_id: companyId || sensor.company_id,
        readings
      },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      message: 'Sensör verisi başarıyla yayınlandı',
      data: {
        sensor_id: sensorId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Sensör verisi yayınlanırken hata oluştu'
    });
  }
};

export const sendNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetType, targetId, notificationType, message } = req.body;
    
    if (!targetType || !targetId || !notificationType) {
      res.status(400).json({
        status: 'error',
        message: 'Eksik bilgiler: targetType, targetId ve notificationType zorunludur'
      });
      return;
    }
    
    // Bildirim verisi oluştur
    const notificationData = {
      type: notificationType,
      message: message || 'Yeni bildirim',
      timestamp: new Date().toISOString(),
      senderId: req.user?.id
    };
    
    // Socket.IO bağlantısı kontrolü
    if (!io) {
      res.status(500).json({
        status: 'error',
        message: 'Socket.IO henüz başlatılmadı'
      });
      return;
    }
    
    // Hedef tipine göre odaya bildirim gönder
    if (targetType === 'company') {
      io.to(`company_${targetId}`).emit('notification', notificationData);
    } else if (targetType === 'sensor') {
      io.to(`sensor_${targetId}`).emit('notification', notificationData);
    } else if (targetType === 'all') {
      io.emit('notification', notificationData);
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Geçersiz targetType: company, sensor veya all olmalıdır'
      });
      return;
    }
    
    // Log kaydı oluştur
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.SENT_NOTIFICATION,
      details: { 
        target_type: targetType,
        target_id: targetId,
        notification_type: notificationType,
        message
      },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      message: 'Bildirim başarıyla gönderildi',
      data: {
        target_type: targetType,
        target_id: targetId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Bildirim gönderilirken hata oluştu'
    });
  }
}; 