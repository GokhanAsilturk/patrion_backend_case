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
exports.updateUser = exports.getAllUsers = exports.findUsersByCompanyId = exports.findUserById = exports.findUserByEmail = exports.createUser = exports.createUsersTable = void 0;
const database_1 = __importDefault(require("../config/database"));
const user_1 = require("../types/user");
const createUsersTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      company_id INTEGER,
      role VARCHAR(20) NOT NULL DEFAULT '${user_1.UserRole.USER}',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );
  `;
    try {
        yield database_1.default.query(createTableQuery);
        console.log('Users tablosu başarıyla oluşturuldu veya zaten vardı');
    }
    catch (error) {
        console.error('Users tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createUsersTable = createUsersTable;
const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, fullName = null, company_id = null, role = user_1.UserRole.USER } = userData;
    const query = `
    INSERT INTO users (username, email, password, full_name, company_id, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt";
  `;
    try {
        const result = yield database_1.default.query(query, [username, email, password, fullName, company_id, role]);
        return result.rows[0];
    }
    catch (error) {
        console.error('Kullanıcı oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createUser = createUser;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    WHERE email = $1;
  `;
    try {
        const result = yield database_1.default.query(query, [email]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Email ile kullanıcı aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.findUserByEmail = findUserByEmail;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    WHERE id = $1;
  `;
    try {
        const result = yield database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('ID ile kullanıcı aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.findUserById = findUserById;
const findUsersByCompanyId = (company_id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, username, email, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    WHERE company_id = $1;
  `;
    try {
        const result = yield database_1.default.query(query, [company_id]);
        return result.rows;
    }
    catch (error) {
        console.error('Şirket ID ile kullanıcı aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.findUsersByCompanyId = findUsersByCompanyId;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, username, email, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    ORDER BY id;
  `;
    try {
        const result = yield database_1.default.query(query);
        return result.rows;
    }
    catch (error) {
        console.error('Tüm kullanıcılar alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getAllUsers = getAllUsers;
const updateUser = (id, userData) => __awaiter(void 0, void 0, void 0, function* () {
    // Güncellenecek alanları ve değerlerini oluştur
    const updates = [];
    const values = [];
    let paramCount = 1;
    // Güncellenebilir alanları kontrol et
    if (userData.email !== undefined) {
        updates.push(`email = $${paramCount}`);
        values.push(userData.email);
        paramCount++;
    }
    if (userData.fullName !== undefined) {
        updates.push(`full_name = $${paramCount}`);
        values.push(userData.fullName);
        paramCount++;
    }
    if (userData.company_id !== undefined) {
        updates.push(`company_id = $${paramCount}`);
        values.push(userData.company_id);
        paramCount++;
    }
    if (userData.role !== undefined) {
        updates.push(`role = $${paramCount}`);
        values.push(userData.role);
        paramCount++;
    }
    // Şifre güncellemesi için ayrı kontrol (şifre hash'lenmişse)
    if (userData.password !== undefined) {
        updates.push(`password = $${paramCount}`);
        values.push(userData.password);
        paramCount++;
    }
    // Güncelleme zamanını ayarla
    updates.push(`updated_at = NOW()`);
    // Güncellenecek alan yoksa hata fırlat
    if (updates.length === 1) { // Sadece updated_at varsa
        throw new Error('Güncellenecek alan bulunamadı');
    }
    // Sorgu oluştur
    const query = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt";
  `;
    values.push(id); // WHERE id = ? için
    try {
        const result = yield database_1.default.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Kullanıcı bulunamadı');
        }
        return result.rows[0];
    }
    catch (error) {
        console.error('Kullanıcı güncellenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.updateUser = updateUser;
