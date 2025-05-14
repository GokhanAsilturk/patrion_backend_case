"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivityStats = exports.getLogsAnalytics = exports.getLogsByAction = exports.getUserLogs = void 0;
const log_model_1 = require("../models/log.model");
const log_1 = require("../types/log");
const user_1 = require("../types/user");
const database_1 = __importDefault(require("../config/database"));
/**
 * Kullanıcı log kayıtlarını listeler
 * Sistem admin: Tüm logları görebilir
 * Şirket admin: Kendi şirketindeki kullanıcıların loglarını görebilir
 * Kullanıcı: Sadece kendi loglarını görebilir
 */
const getUserLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // Eğer userId params'tan gelmiyorsa, oturum açmış kullanıcının id'sini kullan
        const userId = parseInt(req.params.userId, 10) || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        // Erişim kontrolü
        if (userRole !== user_1.UserRole.SYSTEM_ADMIN && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) !== userId) {
            // Şirket yöneticileri için şirket bazlı erişim kontrolü ek olarak yapılabilir
            if (userRole === user_1.UserRole.COMPANY_ADMIN) {
                // Bu kısım, şirket kontrolü gerektiren bir sorgu eklenecek
                // Şirket yöneticisi, şirketindeki kullanıcıların loglarını görebilmeli
            }
            else {
                res.status(403).json({
                    status: 'error',
                    message: 'Bu kullanıcının log kayıtlarına erişim yetkiniz bulunmamaktadır'
                });
                return;
            }
        }
        // Log kaydı oluştur
        yield (0, log_model_1.createUserLog)({
            user_id: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.id) || 0,
            action: log_1.LogAction.VIEWED_LOGS,
            details: { target_user_id: userId },
            ip_address: req.ip
        });
        const logs = yield (0, log_model_1.getUserLogsByUserId)(userId);
        res.json({
            status: 'success',
            results: logs.length,
            data: { logs }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Log kayıtları alınırken hata oluştu'
        });
    }
});
exports.getUserLogs = getUserLogs;
/**
 * Belirli bir eylem tipi için log kayıtlarını listeler
 */
const getLogsByAction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { action } = req.params;
        // Log kaydı oluştur
        yield (0, log_model_1.createUserLog)({
            user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0,
            action: log_1.LogAction.VIEWED_LOGS,
            details: { action_type: action },
            ip_address: req.ip
        });
        const logs = yield (0, log_model_1.getUserLogsByAction)(action);
        res.json({
            status: 'success',
            results: logs.length,
            data: { logs }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Log kayıtları alınırken hata oluştu'
        });
    }
});
exports.getLogsByAction = getLogsByAction;
/**
 * Log analizlerini getirir
 */
const getLogsAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const days = req.query.days ? parseInt(req.query.days, 10) : 7;
        // Log kaydı oluştur
        yield (0, log_model_1.createUserLog)({
            user_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0,
            action: log_1.LogAction.VIEWED_LOGS,
            details: { analytics: true, days },
            ip_address: req.ip
        });
        const analytics = yield (0, log_model_1.getLogAnalytics)(days);
        res.json({
            status: 'success',
            data: { analytics }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Log analizi alınırken hata oluştu'
        });
    }
});
exports.getLogsAnalytics = getLogsAnalytics;
/**
 * Kullanıcı davranış takibi için istatistikleri getirir
 */
const getUserActivityStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = parseInt(req.params.userId, 10) || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0;
        // Erişim kontrolü burada da yapılabilir
        // Basit bir kullanıcı aktivite istatistiği sorgusu
        const query = `
      SELECT 
        action,
        COUNT(*) as count,
        MIN(timestamp) as first_activity,
        MAX(timestamp) as last_activity,
        jsonb_agg(DISTINCT ip_address) as ip_addresses
      FROM user_logs
      WHERE user_id = $1
      GROUP BY action
      ORDER BY count DESC;
    `;
        const { rows } = yield database_1.default.query(query, [userId]);
        // Log kaydı oluştur
        yield (0, log_model_1.createUserLog)({
            user_id: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || 0,
            action: log_1.LogAction.VIEWED_LOGS,
            details: { target_user_id: userId, activity_stats: true },
            ip_address: req.ip
        });
        res.json({
            status: 'success',
            data: { activity_stats: rows }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Kullanıcı aktivite istatistikleri alınırken hata oluştu'
        });
    }
});
exports.getUserActivityStats = getUserActivityStats;
