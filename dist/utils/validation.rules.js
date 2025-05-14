"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logValidation = exports.sensorValidation = exports.userValidation = exports.authValidation = void 0;
const express_validator_1 = require("express-validator");
const user_1 = require("../types/user");
/**
 * Kimlik doğrulama için validasyon kuralları
 */
exports.authValidation = {
    login: [
        (0, express_validator_1.body)('email')
            .notEmpty().withMessage('Email zorunludur')
            .isEmail().withMessage('Geçerli bir email giriniz'),
        (0, express_validator_1.body)('password')
            .notEmpty().withMessage('Şifre zorunludur')
            .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
    ],
    register: [
        (0, express_validator_1.body)('username')
            .notEmpty().withMessage('Kullanıcı adı zorunludur')
            .isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalıdır'),
        (0, express_validator_1.body)('email')
            .notEmpty().withMessage('Email zorunludur')
            .isEmail().withMessage('Geçerli bir email giriniz'),
        (0, express_validator_1.body)('password')
            .notEmpty().withMessage('Şifre zorunludur')
            .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
        (0, express_validator_1.body)('full_name')
            .optional()
            .isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalıdır'),
        (0, express_validator_1.body)('company_id')
            .optional()
            .isInt().withMessage('Şirket ID bir tam sayı olmalıdır'),
        (0, express_validator_1.body)('role')
            .optional()
            .isIn(Object.values(user_1.UserRole)).withMessage('Geçersiz rol')
    ]
};
/**
 * Kullanıcı işlemleri için validasyon kuralları
 */
exports.userValidation = {
    getById: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Kullanıcı ID zorunludur')
            .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır')
    ],
    update: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Kullanıcı ID zorunludur')
            .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır'),
        (0, express_validator_1.body)('email')
            .optional()
            .isEmail().withMessage('Geçerli bir email giriniz'),
        (0, express_validator_1.body)('full_name')
            .optional()
            .isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalıdır'),
        (0, express_validator_1.body)('company_id')
            .optional()
            .isInt().withMessage('Şirket ID bir tam sayı olmalıdır'),
        (0, express_validator_1.body)('role')
            .optional()
            .isIn(Object.values(user_1.UserRole)).withMessage('Geçersiz rol')
    ]
};
/**
 * Sensör işlemleri için validasyon kuralları
 */
exports.sensorValidation = {
    create: [
        (0, express_validator_1.body)('sensor_id')
            .notEmpty().withMessage('Sensör ID zorunludur')
            .isLength({ min: 3 }).withMessage('Sensör ID en az 3 karakter olmalıdır'),
        (0, express_validator_1.body)('name')
            .notEmpty().withMessage('Sensör adı zorunludur')
            .isLength({ min: 2 }).withMessage('Sensör adı en az 2 karakter olmalıdır'),
        (0, express_validator_1.body)('description')
            .optional(),
        (0, express_validator_1.body)('company_id')
            .notEmpty().withMessage('Şirket ID zorunludur')
            .isInt().withMessage('Şirket ID bir tam sayı olmalıdır'),
        (0, express_validator_1.body)('status')
            .optional()
            .isIn(['active', 'inactive', 'maintenance']).withMessage('Geçersiz durum')
    ],
    updateStatus: [
        (0, express_validator_1.param)('id')
            .notEmpty().withMessage('Sensör ID zorunludur')
            .isInt().withMessage('Sensör ID bir tam sayı olmalıdır'),
        (0, express_validator_1.body)('status')
            .notEmpty().withMessage('Durum zorunludur')
            .isIn(['active', 'inactive', 'maintenance']).withMessage('Geçersiz durum')
    ],
    getSensorData: [
        (0, express_validator_1.param)('sensor_id')
            .notEmpty().withMessage('Sensör ID zorunludur'),
        (0, express_validator_1.query)('start')
            .optional()
            .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('end')
            .optional()
            .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır')
    ]
};
/**
 * Log işlemleri için validasyon kuralları
 */
exports.logValidation = {
    getUserLogs: [
        (0, express_validator_1.param)('userId')
            .optional()
            .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır'),
        (0, express_validator_1.query)('startDate')
            .optional()
            .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('endDate')
            .optional()
            .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Sayfa numarası pozitif bir tam sayı olmalıdır'),
        (0, express_validator_1.query)('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında bir tam sayı olmalıdır')
    ],
    getLogsByAction: [
        (0, express_validator_1.param)('action')
            .notEmpty().withMessage('Eylem tipi zorunludur'),
        (0, express_validator_1.query)('startDate')
            .optional()
            .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('endDate')
            .optional()
            .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Sayfa numarası pozitif bir tam sayı olmalıdır'),
        (0, express_validator_1.query)('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında bir tam sayı olmalıdır')
    ],
    getAnalytics: [
        (0, express_validator_1.query)('startDate')
            .optional()
            .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('endDate')
            .optional()
            .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('groupBy')
            .optional()
            .isIn(['daily', 'weekly', 'monthly']).withMessage('Gruplama daily, weekly veya monthly olmalıdır')
    ],
    getUserActivityStats: [
        (0, express_validator_1.param)('userId')
            .optional()
            .isInt().withMessage('Kullanıcı ID bir tam sayı olmalıdır'),
        (0, express_validator_1.query)('startDate')
            .optional()
            .isISO8601().withMessage('Başlangıç tarihi ISO8601 formatında olmalıdır'),
        (0, express_validator_1.query)('endDate')
            .optional()
            .isISO8601().withMessage('Bitiş tarihi ISO8601 formatında olmalıdır')
    ]
};
