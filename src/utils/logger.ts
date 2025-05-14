import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Log dosyaları için dizin oluştur
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Log formatını oluştur
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Winston logger oluştur
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'patrion-sensor-service' },
  transports: [
    // Hata seviyesindeki loglar için ayrı bir dosya
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Tüm loglar için
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Exceptions ve rejections için handler'lar ekle
logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(logDir, 'exceptions.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

logger.rejections.handle(
  new winston.transports.File({ 
    filename: path.join(logDir, 'rejections.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Development ortamında konsola da log yaz
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Uygulama için standart log fonksiyonları
 */
export const log = {
  error: (message: string, meta: Record<string, any> = {}) => {
    logger.error(message, { metadata: meta });
  },
  
  warn: (message: string, meta: Record<string, any> = {}) => {
    logger.warn(message, { metadata: meta });
  },
  
  info: (message: string, meta: Record<string, any> = {}) => {
    logger.info(message, { metadata: meta });
  },
  
  debug: (message: string, meta: Record<string, any> = {}) => {
    logger.debug(message, { metadata: meta });
  },
  
  // HTTP istekleri için özel log fonksiyonu
  http: (req: any, res: any, responseTime: number) => {
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    logger[logLevel]('HTTP İsteği', {
      metadata: {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        userId: req.user?.id
      }
    });
  },
  
  // Veritabanı sorguları için özel log fonksiyonu
  db: (query: string, params: any[], duration: number) => {
    logger.debug('Veritabanı Sorgusu', {
      metadata: {
        query,
        params,
        duration: `${duration}ms`
      }
    });
  },
  
  // Sensör verisi için özel log fonksiyonu
  sensor: (sensorId: string, data: any) => {
    logger.info('Sensör Verisi', {
      metadata: {
        sensorId,
        data
      }
    });
  }
};

// Winston logger'ı da dışa aktar (gerektiğinde doğrudan erişim için)
export default logger; 