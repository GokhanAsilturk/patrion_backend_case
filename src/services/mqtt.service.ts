import mqtt, { MqttClient } from 'mqtt';
import config from '../config/config';
import { MQTTSensorData } from '../types/sensor';
import { saveSensorData } from './sensor.service';
import { writeSensorData } from './influxdb.service';
import { createUserLog } from '../models/log.model';
import { LogAction } from '../types/log';
import { publishSensorData } from '../socket';

let client: MqttClient;

export const initMqttClient = (): void => {
  try {
    const broker = config.mqtt.broker || 'mqtt://mqtt:1883';
    
    client = mqtt.connect(broker, {
      clientId: config.mqtt.clientId,
      username: config.mqtt.username,
      password: config.mqtt.password,
      clean: true,
      reconnectPeriod: 5000
    });

    client.on('connect', () => {
      console.log('MQTT Broker\'a bağlandı');
      
      const topics = [
        'sensors/+/data',
        'sensors/+/status'
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
        
        if (topic.match(/^sensors\/[\w-]+\/data$/)) {
          let sensorData: MQTTSensorData;
          try {
            sensorData = JSON.parse(message.toString());
          } catch (parseError) {
            logInvalidSensorData(topic, message.toString(), 'JSON parse hatası', parseError);
            return;
          }
          
          if (!isValidSensorData(sensorData)) {
            logInvalidSensorData(topic, message.toString(), 'Geçersiz sensör veri formatı');
            return;
          }
          
          await saveSensorData(sensorData);
          
          try {
            await writeSensorData(sensorData);
            
            const sensorId = sensorData.sensor_id;
            const companyId = sensorData.company_id;
            
            publishSensorData(sensorId, {
              temperature: sensorData.temperature,
              humidity: sensorData.humidity,
              timestamp: sensorData.timestamp,
              metadata: sensorData.metadata
            }, companyId);
            
          } catch (influxError) {
            console.error('InfluxDB\'ye veri yazılırken hata:', 
              influxError instanceof Error ? influxError.message : 'Bilinmeyen hata');
          }
        }
        
        if (topic.match(/^sensors\/[\w-]+\/status$/)) {
          let statusData;
          try {
            statusData = JSON.parse(message.toString());
            
            if (statusData && statusData.sensor_id) {
              const sensorId = statusData.sensor_id;
              const companyId = statusData.company_id;
              
              publishSensorData(sensorId, {
                status: statusData.status,
                battery: statusData.battery,
                timestamp: statusData.timestamp || Date.now(),
                message: statusData.message
              }, companyId);
            }
            
          } catch (parseError) {
            logInvalidSensorData(topic, message.toString(), 'JSON parse hatası (durum verisi)', parseError);
            return;
          }
          console.log('Sensör durum bilgisi:', statusData);
        }
      } catch (error) {
        console.error('MQTT mesajı işlenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
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

const isValidSensorData = (data: any): boolean => {
  if (!data.sensor_id || typeof data.sensor_id !== 'string') {
    return false;
  }
  
  if (!data.timestamp || typeof data.timestamp !== 'number') {
    return false;
  }
  
  if (data.temperature !== undefined && typeof data.temperature !== 'number') {
    return false;
  }
  
  if (data.humidity !== undefined && typeof data.humidity !== 'number') {
    return false;
  }
  
  return true;
};

const logInvalidSensorData = async (topic: string, rawData: string, reason: string, error?: any): Promise<void> => {
  try {
    const errorDetails = {
      topic,
      rawData,
      reason,
      error: error instanceof Error ? error.message : error
    };
    
    console.error(`Hatalı sensör verisi: ${reason}`, errorDetails);
    
    await createUserLog({
      user_id: 1,
      action: LogAction.INVALID_SENSOR_DATA,
      details: errorDetails,
      ip_address: 'system'
    });
  } catch (logError) {
    console.error('Hatalı veri loglanırken hata:', logError instanceof Error ? logError.message : 'Bilinmeyen hata');
  }
};

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

export const closeMqttClient = (): void => {
  if (client) {
    client.end();
    console.log('MQTT bağlantısı kapatıldı');
  }
};

function onStatusMessage(topic: string, message: Buffer) {
  try {
    const rawData = message.toString();
    console.log(`MQTT Durum Mesajı Alındı (${topic}):`, rawData);
    
    const data = JSON.parse(rawData);
    console.log('MQTT Mesaj içeriği (parse edilmiş):', data);
  } catch (error) {
  }
}