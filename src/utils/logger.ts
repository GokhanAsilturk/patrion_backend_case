import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'patrion-sensor-service' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(logDir, 'exceptions.log'),
    maxsize: 5242880,
    maxFiles: 5,
  })
);

logger.rejections.handle(
  new winston.transports.File({ 
    filename: path.join(logDir, 'rejections.log'),
    maxsize: 5242880,
    maxFiles: 5,
  })
);

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

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
  
  db: (query: string, params: any[], duration: number) => {
    logger.debug('Veritabanı Sorgusu', {
      metadata: {
        query,
        params,
        duration: `${duration}ms`
      }
    });
  },
  
  sensor: (sensorId: string, data: any) => {
    logger.info('Sensör Verisi', {
      metadata: {
        sensorId,
        data
      }
    });
  }
};

export default logger;