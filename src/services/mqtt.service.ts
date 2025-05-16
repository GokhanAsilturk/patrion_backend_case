import mqtt, { MqttClient } from 'mqtt';
import config from '../config/config';
import { MQTTSensorData } from '../types/sensor';
import { saveSensorData } from './sensor.service';
import { writeSensorData } from './influxdb.service';
import { createUserLog } from '../models/log.model';
import { LogAction } from '../types/log';

let client: MqttClient;

// MQTT İstemcisini başlat
export const initMqttClient = (): void => {
  try {
    const broker = config.mqtt.broker || 'mqtt://localhost:1883';
    
    client = mqtt.connect(broker, {
      clientId: config.mqtt.clientId,
      username: config.mqtt.username,
      password: config.mqtt.password,
      clean: true,
      reconnectPeriod: 5000
    });

    client.on('connect', () => {
      console.log('MQTT Broker\'a bağlandı');
      
      // Sensör konularına abone ol
      const topics = [
        'sensors/+/data',  // Tüm sensörlerin veri yayını
        'sensors/+/status' // Tüm sensörlerin durum yayını
      ];
      
      topics.forEach(topic => {
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`${topic} konusuna abone olurken hata:`, err);
          } else {
            console.log(`${topic} konusuna abone olundu`);
          }
        });
      });
    });

    client.on('message', async (topic, message) => {
      try {
        console.log(`Konu ${topic} üzerinden mesaj alındı:`, message.toString());
        
        // Sensör verisi için konu filtreleme
        if (topic.match(/^sensors\/[\w-]+\/data$/)) {
          // JSON parse kontrolü
          let sensorData: MQTTSensorData;
          try {
            sensorData = JSON.parse(message.toString());
          } catch (parseError) {
            // JSON parse hatası - hatalı veri formatı
            logInvalidSensorData(topic, message.toString(), 'JSON parse hatası', parseError);
            return;
          }
          
          // Gerekli alanların kontrolü
          if (!isValidSensorData(sensorData)) {
            logInvalidSensorData(topic, message.toString(), 'Geçersiz sensör veri formatı');
            return;
          }
          
          // Sensör verisini PostgreSQL'e kaydet
          await saveSensorData(sensorData);
          
          // Sensör verisini InfluxDB'ye de kaydet
          try {
            await writeSensorData(sensorData);
          } catch (influxError) {
            console.error('InfluxDB\'ye veri yazılırken hata:', 
              influxError instanceof Error ? influxError.message : 'Bilinmeyen hata');
            // InfluxDB hatası uygulama akışını durdurmamalı
          }
        }
        
        // Sensör durumu için konu filtreleme
        if (topic.match(/^sensors\/[\w-]+\/status$/)) {
          let statusData;
          try {
            statusData = JSON.parse(message.toString());
          } catch (parseError) {
            // JSON parse hatası - hatalı durum verisi
            logInvalidSensorData(topic, message.toString(), 'JSON parse hatası (durum verisi)', parseError);
            return;
          }
          console.log('Sensör durum bilgisi:', statusData);
          // Durum bilgisini işle (gerekirse)
        }
      } catch (error) {
        console.error('MQTT mesajı işlenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        // Genel hata durumunu logla
        logInvalidSensorData('Genel MQTT Hatası', message.toString(), 'İşleme hatası', error);
      }
    });

    client.on('error', (err) => {
      console.error('MQTT bağlantı hatası:', err);
    });

    client.on('offline', () => {
      console.warn('MQTT istemcisi çevrimdışı');
    });

    client.on('reconnect', () => {
      console.log('MQTT yeniden bağlanıyor...');
    });
  } catch (error) {
    console.error('MQTT istemcisi başlatılırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
  }
};

/**
 * Sensör verisinin geçerli olup olmadığını kontrol eder
 */
const isValidSensorData = (data: any): boolean => {
  // Gerekli alanların kontrolü
  if (!data.sensor_id || typeof data.sensor_id !== 'string') {
    return false;
  }
  
  if (!data.timestamp || typeof data.timestamp !== 'number') {
    return false;
  }
  
  // Diğer alan tür kontrolleri
  if (data.temperature !== undefined && typeof data.temperature !== 'number') {
    return false;
  }
  
  if (data.humidity !== undefined && typeof data.humidity !== 'number') {
    return false;
  }
  
  return true;
};

/**
 * Hatalı sensör verilerini loglar
 */
const logInvalidSensorData = async (topic: string, rawData: string, reason: string, error?: any): Promise<void> => {
  try {
    // Hata detayını oluştur
    const errorDetails = {
      topic,
      rawData,
      reason,
      error: error instanceof Error ? error.message : error
    };
    
    console.error(`Hatalı sensör verisi: ${reason}`, errorDetails);
    
    // user_logs tablosuna kaydet (system userı olarak)
    await createUserLog({
      user_id: 1, // System user ID'si (veritabanında system kullanıcısı oluşturulmalı)
      action: LogAction.INVALID_SENSOR_DATA,
      details: errorDetails,
      ip_address: 'system'
    });
  } catch (logError) {
    // Log kaydı oluşturulurken hata olursa sadece konsola yaz
    console.error('Hatalı veri loglanırken hata:', logError instanceof Error ? logError.message : 'Bilinmeyen hata');
  }
};

// Bir konuya mesaj yayınla
export const publishMessage = (topic: string, message: any): void => {
  if (!client || !client.connected) {
    console.error('MQTT istemcisi bağlı değil. Mesaj yayınlanamıyor.');
    return;
  }
  
  try {
    const messageString = typeof message === 'object' ? JSON.stringify(message) : message;
    client.publish(topic, messageString);
  } catch (error) {
    console.error('MQTT mesajı yayınlanırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
  }
};

// MQTT istemcisini kapat
export const closeMqttClient = (): void => {
  if (client) {
    client.end();
    console.log('MQTT bağlantısı kapatıldı');
  }
}; 