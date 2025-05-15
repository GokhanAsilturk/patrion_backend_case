import { body, param, query } from 'express-validator';
import { UserRole } from '../types/user';

/**
 * Kimlik doğrulama için validasyon kuralları
 */
export const authValidation = {
  login: [
    body('email')
      .notEmpty().withMessage('Email zorunludur')
      .isEmail().withMessage('Geçerli bir email giriniz'),
    body('password')
      .notEmpty().withMessage('Şifre zorunludur')
      .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
  ],
  register: [
    body('username')
      .notEmpty().withMessage('Kullanıcı adı zorunludur')
      .isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalıdır'),
    body('email')
      .notEmpty().withMessage('Email zorunludur')
      .isEmail().withMessage('Geçerli bir email giriniz'),
    body('password')
      .notEmpty().withMessage('Şifre zorunludur')
      .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
    body('full_name')
      .optional()
      .isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalıdır'),
    body('company_id')
      .optional()
      .isInt().withMessage('Şirket ID bir tam sayı olmalıdır'),
    body('role')
      .optional()
      .isIn(Object.values(UserRole)).withMessage('Geçersiz rol')
  ]
};

/**
 * Kullanıcı işlemleri için validasyon kuralları
 */
export const userValidation = {
  getById: [
    param('id')
      .notEmpty().withMessage('Kullanıcı ID zorunludur')
      .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır')
  ],
  getByUsername: [
    param('username')
      .notEmpty().withMessage('Kullanıcı adı zorunludur')
      .isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalıdır')
  ],
  update: [
    param('id')
      .notEmpty().withMessage('Kullanıcı ID zorunludur')
      .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır'),
    body('email')
      .optional()
      .isEmail().withMessage('Geçerli bir email giriniz'),
    body('full_name')
      .optional()
      .isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalıdır'),
    body('company_id')
      .optional()
      .isInt().withMessage('Şirket ID bir tam sayı olmalıdır'),
    body('role')
      .optional()
      .isIn(Object.values(UserRole)).withMessage('Geçersiz rol')
  ]
};

/**
 * Sensör işlemleri için validasyon kuralları
 */
export const sensorValidation = {
  create: [
    body('sensor_id')
      .notEmpty().withMessage('Sensör ID zorunludur')
      .isLength({ min: 3 }).withMessage('Sensör ID en az 3 karakter olmalıdır'),
    body('name')
      .notEmpty().withMessage('Sensör adı zorunludur')
      .isLength({ min: 2 }).withMessage('Sensör adı en az 2 karakter olmalıdır'),
    body('description')
      .optional(),
    body('company_id')
      .notEmpty().withMessage('Şirket ID zorunludur')
      .isInt().withMessage('Şirket ID bir tam sayı olmalıdır'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'maintenance']).withMessage('Geçersiz durum')
  ],
  updateStatus: [
    param('id')
      .notEmpty().withMessage('Sensör ID zorunludur')
      .isInt().withMessage('Sensör ID bir tam sayı olmalıdır'),
    body('status')
      .notEmpty().withMessage('Durum zorunludur')
      .isIn(['active', 'inactive', 'maintenance']).withMessage('Geçersiz durum')
  ],
  getSensorData: [
    param('sensor_id')
      .notEmpty().withMessage('Sensör ID zorunludur'),
    query('start')
      .optional()
      .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
    query('end')
      .optional()
      .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır')
  ]
};

/**
 * Log işlemleri için validasyon kuralları
 */
export const logValidation = {
  getUserLogs: [
    param('userId')
      .optional()
      .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır'),
    query('startDate')
      .optional()
      .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
    query('endDate')
      .optional()
      .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Sayfa numarası pozitif bir tam sayı olmalıdır'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında bir tam sayı olmalıdır')
  ],
  getLogsByAction: [
    param('action')
      .notEmpty().withMessage('Eylem tipi zorunludur'),
    query('startDate')
      .optional()
      .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
    query('endDate')
      .optional()
      .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Sayfa numarası pozitif bir tam sayı olmalıdır'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında bir tam sayı olmalıdır')
  ],
  getAnalytics: [
    query('startDate')
      .optional()
      .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
    query('endDate')
      .optional()
      .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır'),
    query('groupBy')
      .optional()
      .isIn(['daily', 'weekly', 'monthly']).withMessage('Gruplama daily, weekly veya monthly olmalıdır')
  ],
  getUserActivityStats: [
    param('userId')
      .optional()
      .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır'),
    query('startDate')
      .optional()
      .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
    query('endDate')
      .optional()
      .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır')
  ]
}; 