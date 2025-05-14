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
exports.closeMqttClient = exports.publishMessage = exports.initMqttClient = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const config_1 = __importDefault(require("../config/config"));
const sensor_service_1 = require("./sensor.service");
const influxdb_service_1 = require("./influxdb.service");
let client;
// MQTT İstemcisini başlat
const initMqttClient = () => {
    try {
        const broker = config_1.default.mqtt.broker || 'mqtt://localhost:1883';
        client = mqtt_1.default.connect(broker, {
            clientId: config_1.default.mqtt.clientId,
            username: config_1.default.mqtt.username,
            password: config_1.default.mqtt.password,
            clean: true,
            reconnectPeriod: 5000
        });
        client.on('connect', () => {
            console.log('MQTT Broker\'a bağlandı');
            // Sensör konularına abone ol
            const topics = [
                'sensors/+/data', // Tüm sensörlerin veri yayını
                'sensors/+/status' // Tüm sensörlerin durum yayını
            ];
            topics.forEach(topic => {
                client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`${topic} konusuna abone olurken hata:`, err);
                    }
                    else {
                        console.log(`${topic} konusuna abone olundu`);
                    }
                });
            });
        });
        client.on('message', (topic, message) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`Konu ${topic} üzerinden mesaj alındı:`, message.toString());
                // Sensör verisi için konu filtreleme
                if (topic.match(/^sensors\/[\w-]+\/data$/)) {
                    const sensorData = JSON.parse(message.toString());
                    // Sensör verisini PostgreSQL'e kaydet
                    yield (0, sensor_service_1.saveSensorData)(sensorData);
                    // Sensör verisini InfluxDB'ye de kaydet
                    try {
                        yield (0, influxdb_service_1.writeSensorData)(sensorData);
                    }
                    catch (influxError) {
                        console.error('InfluxDB\'ye veri yazılırken hata:', influxError instanceof Error ? influxError.message : 'Bilinmeyen hata');
                        // InfluxDB hatası uygulama akışını durdurmamalı
                    }
                }
                // Sensör durumu için konu filtreleme
                if (topic.match(/^sensors\/[\w-]+\/status$/)) {
                    const statusData = JSON.parse(message.toString());
                    console.log('Sensör durum bilgisi:', statusData);
                    // Durum bilgisini işle (gerekirse)
                }
            }
            catch (error) {
                console.error('MQTT mesajı işlenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
            }
        }));
        client.on('error', (err) => {
            console.error('MQTT bağlantı hatası:', err);
        });
        client.on('offline', () => {
            console.warn('MQTT istemcisi çevrimdışı');
        });
        client.on('reconnect', () => {
            console.log('MQTT yeniden bağlanıyor...');
        });
    }
    catch (error) {
        console.error('MQTT istemcisi başlatılırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
};
exports.initMqttClient = initMqttClient;
// Bir konuya mesaj yayınla
const publishMessage = (topic, message) => {
    if (!client || !client.connected) {
        console.error('MQTT istemcisi bağlı değil. Mesaj yayınlanamıyor.');
        return;
    }
    try {
        const messageString = typeof message === 'object' ? JSON.stringify(message) : message;
        client.publish(topic, messageString);
    }
    catch (error) {
        console.error('MQTT mesajı yayınlanırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
};
exports.publishMessage = publishMessage;
// MQTT istemcisini kapat
const closeMqttClient = () => {
    if (client) {
        client.end();
        console.log('MQTT bağlantısı kapatıldı');
    }
};
exports.closeMqttClient = closeMqttClient;
