import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { log } from '../utils/logger';

/**
 * API rate limiting middleware
 * Belirli bir IP adresinden gelen istekleri sınırlar
 * DDoS saldırılarına karşı koruma sağlar
 * 
 * @param max Belirli bir zaman diliminde izin verilen maksimum istek sayısı
 * @param windowMs Zaman dilimi (milisaniye cinsinden)
 * @param message Rate limit aşıldığında gösterilecek hata mesajı
 * @returns Express middleware
 */
export const rateLimiter = (
  max: number = 100,           // 100 istek
  windowMs: number = 15 * 60 * 1000,  // 15 dakika
  message: string = 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message
    },
    headers: true,
    // IP adresi yerine kullanıcı ID'si veya diğer kriterlere göre limitleme yapmak için keyGenerator fonksiyonu özelleştirilebilir
    keyGenerator: (req: Request): string => {
      return req.ip || 'unknown';
    },
    // Rate limit aşıldığında loglama
    handler: (req: Request, res: Response, next: NextFunction, options: any) => {
      log.warn('Rate limit aşıldı', {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.headers['user-agent']
      });
      
      res.status(429).json(options.message);
    }
  });
};

/**
 * Hassas API rotaları için daha sıkı rate limiting
 * Örneğin: kimlik doğrulama, şifre sıfırlama vb.
 */
export const strictRateLimiter = rateLimiter(
  20,                   // 20 istek
  30 * 60 * 1000,       // 30 dakika
  'Hassas bir işlem için çok fazla deneme yaptınız. Güvenlik nedeniyle lütfen 30 dakika sonra tekrar deneyin.'
);

/**
 * Genel rotalar için standart rate limiting
 */
export const standardRateLimiter = rateLimiter();

/**
 * Sensor veri alımı gibi yüksek trafikli rotalar için yüksek limitli rate limiting
 */
export const highVolumeRateLimiter = rateLimiter(
  1000,                 // 1000 istek
  60 * 1000,            // 1 dakika
  'Çok fazla veri isteği gönderdiniz. Lütfen 1 dakika sonra tekrar deneyin.'
); 