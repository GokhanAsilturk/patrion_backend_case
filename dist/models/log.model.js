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
exports.getLogAnalytics = exports.getUserLogsByAction = exports.getUserLogsByUserId = exports.createUserLog = exports.createUserLogsTable = void 0;
const database_1 = __importDefault(require("../config/database"));
const createUserLogsTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      action VARCHAR(50) NOT NULL,
      details JSONB,
      ip_address VARCHAR(50),
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
    try {
        yield database_1.default.query(createTableQuery);
        console.log('User_logs tablosu başarıyla oluşturuldu veya zaten vardı');
    }
    catch (error) {
        console.error('User_logs tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createUserLogsTable = createUserLogsTable;
const createUserLog = (logData) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, action, details = null, ip_address = null, timestamp = new Date() } = logData;
    const query = `
    INSERT INTO user_logs (user_id, action, details, ip_address, timestamp)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, action, details, ip_address, timestamp, created_at as "createdAt";
  `;
    try {
        const result = yield database_1.default.query(query, [
            user_id,
            action,
            details ? JSON.stringify(details) : null,
            ip_address,
            timestamp
        ]);
        return result.rows[0];
    }
    catch (error) {
        console.error('Kullanıcı log kaydı oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createUserLog = createUserLog;
const getUserLogsByUserId = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, user_id, action, details, ip_address, timestamp, created_at as "createdAt"
    FROM user_logs
    WHERE user_id = $1
    ORDER BY timestamp DESC;
  `;
    try {
        const result = yield database_1.default.query(query, [user_id]);
        return result.rows;
    }
    catch (error) {
        console.error('Kullanıcı ID ile loglar aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getUserLogsByUserId = getUserLogsByUserId;
const getUserLogsByAction = (action) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, user_id, action, details, ip_address, timestamp, created_at as "createdAt"
    FROM user_logs
    WHERE action = $1
    ORDER BY timestamp DESC;
  `;
    try {
        const result = yield database_1.default.query(query, [action]);
        return result.rows;
    }
    catch (error) {
        console.error('Action ile loglar aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getUserLogsByAction = getUserLogsByAction;
const getLogAnalytics = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (days = 7) {
    // Belirli bir süre içindeki log kayıtlarının analizini yapan SQL sorgusu
    const query = `
    SELECT 
      action,
      COUNT(*) as count,
      MIN(timestamp) as first_activity,
      MAX(timestamp) as last_activity,
      COUNT(DISTINCT user_id) as unique_users
    FROM user_logs
    WHERE timestamp > NOW() - INTERVAL '${days} days'
    GROUP BY action
    ORDER BY count DESC;
  `;
    try {
        const result = yield database_1.default.query(query);
        return result.rows;
    }
    catch (error) {
        console.error('Log analitiği alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getLogAnalytics = getLogAnalytics;
