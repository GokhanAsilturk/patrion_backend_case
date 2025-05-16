import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import { ErrorCode, HTTP_STATUS_CODES } from '../types/error';
import { log } from '../utils/logger';
import { validationResult, Result, ValidationError as ExpressValidationError } from 'express-validator';

/**
 * 404 hata yakalama
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(`${req.originalUrl} adresi bulunamadı`, ErrorCode.NOT_FOUND);
  next(err);
};

/**
 * Validasyon hata yakalama
 */
export const validationErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Result && err.array) {
    return res.status(400).json({
      status: 'error',
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validasyon hatası',
      errors: err.array()
    });
  }
  next(err);
};

/**
 * PostgreSQL hata yakalama
 */
export const postgresErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Duplicate key hatasını kontrol et (PostgreSQL error code 23505)
  if (err.code === '23505') {
    const message = 'Yinelenen veri hatası';
    error = new AppError(message, ErrorCode.DUPLICATE_ENTRY);
    return next(error);
  }

  // Foreign key ihlali (PostgreSQL error code 23503)
  if (err.code === '23503') {
    const message = 'İlişkisel veri hatası';
    error = new AppError(message, ErrorCode.FOREIGN_KEY_VIOLATION);
    return next(error);
  }

  // Tablo bulunamadı hatası (PostgreSQL error code 42P01)
  if (err.code === '42P01') {
    const message = 'Veritabanı tablo hatası';
    error = new AppError(message, ErrorCode.DB_QUERY_ERROR);
    return next(error);
  }

  next(err);
};

/**
 * Beklenmeyen hata yakalama
 */
export const unexpectedErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Operasyonel olmayan hatalar için process.exit(1) düşünülebilir
  if (err instanceof AppError && !err.isOperational) {
    log.error('KRITIK HATA: İşlemsel olmayan hata yakalandı!', {
      error: err.message,
      stack: err.stack
    });
    
    // Geliştirme ortamında hatanın tam detaylarını göster
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        status: 'error',
        message: err.message,
        stack: err.stack,
        error: err
      });
    }
    
    // Üretim ortamında genel hata mesajı göster
    return res.status(500).json({
      status: 'error',
      message: 'Bir şeyler yanlış gitti! Lütfen daha sonra tekrar deneyin.'
    });
  }
  
  next(err);
};

/**
 * JWT hata yakalama
 */
export const jwtErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      code: ErrorCode.TOKEN_INVALID,
      message: 'Geçersiz token. Lütfen tekrar giriş yapın.'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: ErrorCode.TOKEN_EXPIRED,
      message: 'Token süresi doldu. Lütfen tekrar giriş yapın.'
    });
  }
  
  next(err);
};

/**
 * Genel hata işleme
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // AppError sınıfımızdan bir hata mı?
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  
  // Bilinmeyen hata - Genel hata
  const statusCode = err.statusCode || HTTP_STATUS_CODES[ErrorCode.UNKNOWN_ERROR];
  const errorCode = err.errorCode || ErrorCode.UNKNOWN_ERROR;
  
  log.error('Beklenmeyen hata', {
    error: err.message || 'Bilinmeyen hata',
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  res.status(statusCode).json({
    status: 'error',
    code: errorCode,
    message: err.message || 'Bir hata oluştu'
  });
}; 