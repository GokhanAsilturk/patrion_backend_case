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
exports.getSensorDataByTimeRange = exports.getLatestSensorData = exports.insertSensorData = exports.saveSensorData = void 0;
const database_1 = __importDefault(require("../config/database"));
const sensor_model_1 = require("../models/sensor.model");
const socket_1 = require("../socket");
// MQTT'den gelen sensör verisini işle ve kaydet
const saveSensorData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sensör ID'nin veritabanında olup olmadığını kontrol et
        const sensor = yield (0, sensor_model_1.getSensorBySensorId)(data.sensor_id);
        if (!sensor) {
            console.warn(`Bilinmeyen sensör ID: ${data.sensor_id}`);
            return null;
        }
        // Veriyi standardize et
        const sensorData = {
            sensor_id: data.sensor_id,
            timestamp: new Date(data.timestamp * 1000), // Unix timestamp'i Date'e çevir
            temperature: data.temperature,
            humidity: data.humidity,
            raw_data: data // Tüm ham veriyi sakla
        };
        // Veriyi veritabanına kaydet
        const savedData = yield (0, exports.insertSensorData)(sensorData);
        // Gerçek zamanlı veri yayını yap
        socket_1.io === null || socket_1.io === void 0 ? void 0 : socket_1.io.emit(`sensor/${data.sensor_id}/data`, savedData);
        return savedData;
    }
    catch (error) {
        console.error('Sensör verisi kaydedilirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        return null;
    }
});
exports.saveSensorData = saveSensorData;
// Sensör verisini veritabanına kaydet
const insertSensorData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { sensor_id, timestamp, temperature, humidity, pressure, raw_data } = data;
    const query = `
    INSERT INTO sensor_data (sensor_id, timestamp, temperature, humidity, pressure, raw_data)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, sensor_id, timestamp, temperature, humidity, pressure, raw_data, created_at as "createdAt";
  `;
    try {
        const result = yield database_1.default.query(query, [
            sensor_id,
            timestamp,
            temperature || null,
            humidity || null,
            pressure || null,
            JSON.stringify(raw_data)
        ]);
        return result.rows[0];
    }
    catch (error) {
        console.error('Sensör verisi veritabanına kaydedilirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.insertSensorData = insertSensorData;
// Bir sensörün en son verisini getir
const getLatestSensorData = (sensor_id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, sensor_id, timestamp, temperature, humidity, pressure, raw_data, created_at as "createdAt"
    FROM sensor_data
    WHERE sensor_id = $1
    ORDER BY timestamp DESC
    LIMIT 1;
  `;
    try {
        const result = yield database_1.default.query(query, [sensor_id]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error('Son sensör verisi alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getLatestSensorData = getLatestSensorData;
// Belirli bir zaman aralığındaki sensör verilerini getir
const getSensorDataByTimeRange = (sensor_id, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, sensor_id, timestamp, temperature, humidity, pressure, raw_data, created_at as "createdAt"
    FROM sensor_data
    WHERE sensor_id = $1 AND timestamp BETWEEN $2 AND $3
    ORDER BY timestamp;
  `;
    try {
        const result = yield database_1.default.query(query, [sensor_id, start, end]);
        return result.rows;
    }
    catch (error) {
        console.error('Zaman aralığındaki sensör verileri alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.getSensorDataByTimeRange = getSensorDataByTimeRange;
