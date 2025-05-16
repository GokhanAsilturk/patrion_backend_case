import { ErrorCode, HTTP_STATUS_CODES } from '../types/error';
import { log } from './logger';

export class AppError extends Error {
  statusCode: number;
  errorCode: ErrorCode;
  details?: Record<string, any>;
  isOperational: boolean;

  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    details?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.statusCode = HTTP_STATUS_CODES[errorCode];
    this.details = details;
    this.isOperational = isOperational; 

    Error.captureStackTrace(this, this.constructor);
    
    
    this.logError();
  }

  logError(): void {
    log.error(`[${this.errorCode}] ${this.message}`, {
      error: {
        name: this.name,
        code: this.errorCode,
        statusCode: this.statusCode,
        message: this.message,
        stack: this.stack,
        details: this.details
      }
    });
  }

  toJSON(): Record<string, any> {
    return {
      status: 'error',
      code: this.errorCode,
      message: this.message,
      details: this.details
    };
  }
}

/**
 * Validasyon hatası 
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

/**
 * Kimlik doğrulama hatası
 */
export class AuthenticationError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.UNAUTHORIZED, details?: Record<string, any>) {
    super(message, errorCode, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Yetkilendirme hatası
 */
export class AuthorizationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.FORBIDDEN, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Bulunamadı hatası
 */
export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCode.NOT_FOUND, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Veritabanı hatası
 */
export class DatabaseError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.DB_QUERY_ERROR, details?: Record<string, any>) {
    super(message, errorCode, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Sensör hatası
 */
export class SensorError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.SENSOR_DATA_INVALID, details?: Record<string, any>) {
    super(message, errorCode, details);
    this.name = 'SensorError';
  }
}

/**
 * InfluxDB hatası
 */
export class InfluxDbError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.INFLUXDB_QUERY_ERROR, details?: Record<string, any>) {
    super(message, errorCode, details);
    this.name = 'InfluxDbError';
  }
}

/**
 * MQTT hatası
 */
export class MqttError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.MQTT_CONNECTION_ERROR, details?: Record<string, any>) {
    super(message, errorCode, details);
    this.name = 'MqttError';
  }
}

/**
 * İş mantığı hatası
 */
export class BusinessError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION, details?: Record<string, any>) {
    super(message, errorCode, details);
    this.name = 'BusinessError';
  }
}

/**
 * Hata mesajları
 */
export const ErrorMessages = {
  UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır',
  INVALID_CREDENTIALS: 'Geçersiz kullanıcı adı veya şifre',
  TOKEN_EXPIRED: 'Oturum süresi doldu, lütfen yeniden giriş yapın',
  TOKEN_INVALID: 'Geçersiz veya bozuk token',
  FORBIDDEN: 'Bu kaynağa erişim izniniz yok',
  NOT_FOUND: 'İstenen kaynak bulunamadı',
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  USER_ALREADY_EXISTS: 'Bu email adresi zaten kayıtlı',
  SENSOR_NOT_FOUND: 'Sensör bulunamadı',
  INVALID_REQUEST: 'Geçersiz istek',
  VALIDATION_ERROR: 'Giriş verileri doğrulanamadı'
}; 