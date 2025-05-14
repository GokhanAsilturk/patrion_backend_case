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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSensorDataInRange = exports.getSensorDataLast24Hours = exports.writeSensorData = void 0;
const influxdb_client_1 = require("@influxdata/influxdb-client");
const config_1 = __importDefault(require("../config/config"));
// InfluxDB bağlantısı için koşullu kontrol
let writeClient;
let queryClient;
try {
    const { writeClient: wc, queryClient: qc } = require('../config/influxdb');
    writeClient = wc;
    queryClient = qc;
    console.log('InfluxDB bağlantısı başarıyla kuruldu');
}
catch (error) {
    console.warn('InfluxDB bağlantısı kurulamadı, sadece PostgreSQL kullanılacak:', error instanceof Error ? error.message : 'Bilinmeyen hata');
}
/**
 * InfluxDB'nin bağlı olup olmadığını kontrol eder
 */
const isInfluxDBConnected = () => {
    return !!writeClient && !!queryClient;
};
/**
 * Sensör verisini InfluxDB'ye yazar
 */
const writeSensorData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // InfluxDB bağlantısı yoksa işlemi atla
    if (!isInfluxDBConnected()) {
        console.log('InfluxDB bağlantısı yok, veri kaydedilmiyor');
        return;
    }
    try {
        // Sensör verisi için yeni bir Point oluştur
        const point = new influxdb_client_1.Point('sensor_reading')
            .tag('sensor_id', data.sensor_id)
            .timestamp(new Date(data.timestamp * 1000));
        // Dinamik olarak tüm değerleri ekle
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'sensor_id' && key !== 'timestamp') {
                if (typeof value === 'number') {
                    point.floatField(key, value);
                }
                else if (typeof value === 'string') {
                    point.stringField(key, value);
                }
                else if (typeof value === 'boolean') {
                    point.booleanField(key, value);
                }
                else if (value !== null && typeof value === 'object') {
                    point.stringField(key, JSON.stringify(value));
                }
            }
        });
        // Veriyi InfluxDB'ye yaz
        writeClient.writePoint(point);
        yield writeClient.flush();
        console.log(`Sensör verisi InfluxDB'ye kaydedildi: ${data.sensor_id}`);
        return;
    }
    catch (error) {
        console.error('InfluxDB\'ye veri yazılırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        // Hatayı fırlatma, sadece logla
        console.warn('InfluxDB hatası uygulama akışını durdurmadı, devam ediliyor');
    }
});
exports.writeSensorData = writeSensorData;
/**
 * Son 24 saat içindeki sensör verilerini getirir
 */
const getSensorDataLast24Hours = (sensorId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    // InfluxDB bağlantısı yoksa boş dizi döndür
    if (!isInfluxDBConnected()) {
        console.log('InfluxDB bağlantısı yok, veri alınamıyor');
        return [];
    }
    try {
        const query = `
      from(bucket: "${config_1.default.influxdb.bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r._measurement == "sensor_reading")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
    `;
        const results = [];
        try {
            for (var _d = true, _e = __asyncValues(queryClient.iterateRows(query)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const { values, tableMeta } = _c;
                results.push(tableMeta.toObject(values));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return results;
    }
    catch (error) {
        console.error('InfluxDB\'den veri alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        return []; // Hata durumunda boş dizi döndür
    }
});
exports.getSensorDataLast24Hours = getSensorDataLast24Hours;
/**
 * Belirli bir zaman aralığındaki sensör verilerini getirir
 */
const getSensorDataInRange = (sensorId, startTime, endTime) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_2, _b, _c;
    // InfluxDB bağlantısı yoksa boş dizi döndür
    if (!isInfluxDBConnected()) {
        console.log('InfluxDB bağlantısı yok, veri alınamıyor');
        return [];
    }
    try {
        const query = `
      from(bucket: "${config_1.default.influxdb.bucket}")
        |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
        |> filter(fn: (r) => r._measurement == "sensor_reading")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
    `;
        const results = [];
        try {
            for (var _d = true, _e = __asyncValues(queryClient.iterateRows(query)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const { values, tableMeta } = _c;
                results.push(tableMeta.toObject(values));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return results;
    }
    catch (error) {
        console.error('InfluxDB\'den veri alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        return []; // Hata durumunda boş dizi döndür
    }
});
exports.getSensorDataInRange = getSensorDataInRange;
