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
exports.updateSensorStatus = exports.getSensorsByCompanyId = exports.getSensorBySensorId = exports.getSensorById = exports.createSensor = exports.createSensorDataTable = exports.createSensorsTable = void 0;
const database_1 = __importDefault(require("../config/database"));
const createSensorsTable = () => __awaiter(void 0, void 0, void 0, function* () {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sensors (
      id SERIAL PRIMARY KEY,
      sensor_id VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      company_id INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
  `;
    try {
        yield database_1.default.query(createTableQuery);
        console.log('Sensors tablosu başarıyla oluşturuldu veya zaten vardı');
    }
    catch (error) {
        console.error('Sensors tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createSensorsTable = createSensorsTable;
const createSensorDataTable = () => __awaiter(void 0, void 0, void 0, function* () {
    // PostgreSQL'de sensör verilerini saklayacak geçici tablo
    // Gerçek uygulama için InfluxDB kullanılacak
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sensor_data (
      id SERIAL PRIMARY KEY,
      sensor_id VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      temperature DECIMAL(10, 2),
      humidity DECIMAL(10, 2),
      pressure DECIMAL(10, 2),
      raw_data JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE
    );
  `;
    try {
        yield database_1.default.query(createTableQuery);
        console.log('Sensor_data tablosu başarıyla oluşturuldu veya zaten vardı');
    }
    catch (error) {
        console.error('Sensor_data tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createSensorDataTable = createSensorDataTable;
const createSensor = (sensorData) => __awaiter(void 0, void 0, void 0, function* () {
    const { sensor_id, name, description = null, company_id, status = 'active' } = sensorData;
    const query = `
    INSERT INTO sensors (sensor_id, name, description, company_id, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt";
  `;
    try {
        const result = yield database_1.default.query(query, [sensor_id, name, description, company_id, status]);
        return result.rows[0];
    }
    catch (error) {
        console.error('Sensör oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.createSensor = createSensor;
const getSensorById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM sensors
    WHERE id = $1;
  `;
    try {
        const result = yield database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('ID ile sensör aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getSensorById = getSensorById;
const getSensorBySensorId = (sensor_id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM sensors
    WHERE sensor_id = $1;
  `;
    try {
        const result = yield database_1.default.query(query, [sensor_id]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Sensor ID ile sensör aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getSensorBySensorId = getSensorBySensorId;
const getSensorsByCompanyId = (company_id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM sensors
    WHERE company_id = $1
    ORDER BY id;
  `;
    try {
        const result = yield database_1.default.query(query, [company_id]);
        return result.rows;
    }
    catch (error) {
        console.error('Şirket ID ile sensörler aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getSensorsByCompanyId = getSensorsByCompanyId;
const updateSensorStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE sensors
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt";
  `;
    try {
        const result = yield database_1.default.query(query, [status, id]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Sensör durumu güncellenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.updateSensorStatus = updateSensorStatus;
