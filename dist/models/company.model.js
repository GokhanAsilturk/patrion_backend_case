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
exports.updateCompany = exports.getAllCompanies = exports.getCompanyById = exports.createCompany = exports.createCompaniesTable = void 0;
const database_1 = __importDefault(require("../config/database"));
const createCompaniesTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
    try {
        yield database_1.default.query(createTableQuery);
        console.log('Companies tablosu başarıyla oluşturuldu veya zaten vardı');
    }
    catch (error) {
        console.error('Companies tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createCompaniesTable = createCompaniesTable;
const createCompany = (companyData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description = null, status = 'active' } = companyData;
    const query = `
    INSERT INTO companies (name, description, status)
    VALUES ($1, $2, $3)
    RETURNING id, name, description, status, created_at as "createdAt", updated_at as "updatedAt";
  `;
    try {
        const result = yield database_1.default.query(query, [name, description, status]);
        return result.rows[0];
    }
    catch (error) {
        console.error('Şirket oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createCompany = createCompany;
const getCompanyById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, name, description, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM companies
    WHERE id = $1;
  `;
    try {
        const result = yield database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('ID ile şirket aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getCompanyById = getCompanyById;
const getAllCompanies = () => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, name, description, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM companies
    ORDER BY id;
  `;
    try {
        const result = yield database_1.default.query(query);
        return result.rows;
    }
    catch (error) {
        console.error('Tüm şirketler alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getAllCompanies = getAllCompanies;
const updateCompany = (id, companyData) => __awaiter(void 0, void 0, void 0, function* () {
    // Güncelleme zamanını ayarla
    const updates = Object.assign(Object.assign({}, companyData), { updated_at: new Date() });
    // Dinamik güncelleme sorgusu oluştur
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    // Boş güncelleme kontrolü
    if (keys.length === 0) {
        throw new Error('Güncellenecek veri bulunamadı');
    }
    // Sorgu için set ifadelerini oluştur
    const setClauses = keys.map((key, index) => {
        // Camel case'i snake case'e çevir (örn: createdAt -> created_at)
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${snakeKey} = $${index + 1}`;
    }).join(', ');
    const query = `
    UPDATE companies 
    SET ${setClauses}
    WHERE id = $${keys.length + 1}
    RETURNING id, name, description, status, created_at as "createdAt", updated_at as "updatedAt";
  `;
    try {
        const result = yield database_1.default.query(query, [...values, id]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Şirket güncellenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.updateCompany = updateCompany;
