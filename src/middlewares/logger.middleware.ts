import { Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

/**
 * HTTP isteklerini loglayan middleware
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  // İstek zamanını kaydet
  const startTime = Date.now();
  
  // Response tamamlandığında log oluştur
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    log.http(req, res, responseTime);
  });
  
  next();
}; 