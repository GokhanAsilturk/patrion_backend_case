import mqtt, { MqttClient } from 'mqtt';
import config from '../config/config';
import { MQTTSensorData } from '../types/sensor';
import { saveSensorData } from './sensor.service';

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
          const sensorData: MQTTSensorData = JSON.parse(message.toString());
          
          // Sensör verisini veritabanına kaydet
          await saveSensorData(sensorData);
        }
        
        // Sensör durumu için konu filtreleme
        if (topic.match(/^sensors\/[\w-]+\/status$/)) {
          const statusData = JSON.parse(message.toString());
          console.log('Sensör durum bilgisi:', statusData);
          // Durum bilgisini işle (gerekirse)
        }
      } catch (error) {
        console.error('MQTT mesajı işlenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
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