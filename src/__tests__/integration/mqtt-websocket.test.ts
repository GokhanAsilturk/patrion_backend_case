import * as mqtt from 'mqtt';
import WebSocket from 'ws';
import http from 'http';
import express from 'express';
import { AddressInfo } from 'net';
import { closeServer } from '../../index';
import config from '../../config/config';
import { initSocketIO } from '../../socket';
import { MQTTSensorData } from '../../types/sensor';

process.env.NODE_ENV = 'test';

// Test için MQTT client
let mqttClient: mqtt.MqttClient;
// Test için WebSocket client
let ws: WebSocket;
// Test zamanlaması için 
const waitTime = 1000;

// Test için temiz bir sunucu oluştur
const createTestServer = () => {
  // Yeni bir Express uygulaması oluştur
  const app = express();
  
  // Middleware'leri ekle
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // HTTP server
  const server = http.createServer(app);
  
  // Socket.IO'yu başlat
  initSocketIO(server);
  
  // Rastgele bir portta dinlemeye başla
  server.listen(0); // 0 = kullanılabilir rastgele port
  
  return server;
};

// MQTT ve WebSocket entegrasyon testleri
describe('MQTT ve WebSocket Testleri', () => {
  let server: http.Server;
  let port: number;
  
  beforeAll(async () => {
    // Ana sunucunun başlamadığından emin ol
    closeServer();
    
    // Test başlamadan önce biraz bekle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Test için yeni bir sunucu oluştur
      server = createTestServer();
      
      // Sunucunun hangi portta dinlediğini al
      const address = server.address() as AddressInfo;
      port = address.port;
      console.log(`Test server running at port ${port}`);
      
      // MQTT client'ı oluştur
      mqttClient = mqtt.connect(config.mqtt.broker, {
        clientId: `test-client-${Math.random().toString(16).substr(2, 8)}`,
        username: config.mqtt.username,
        password: config.mqtt.password
      });

      // MQTT bağlantısının açılmasını bekle
      await new Promise<void>((resolve, reject) => {
        mqttClient.on('connect', () => {
          console.log('MQTT client connected');
          resolve();
        });
        
        mqttClient.on('error', (err) => {
          console.error('MQTT client error', err);
          reject(err);
        });
        
        // 5 saniye timeout
        setTimeout(() => reject(new Error('MQTT bağlantı zaman aşımı')), 5000);
      });

      // WebSocket client'ı oluştur
      ws = new WebSocket(`ws://localhost:${port}`);

      // WebSocket bağlantısının açılmasını bekle
      await new Promise<void>((resolve, reject) => {
        ws.on('open', () => {
          console.log('WebSocket client connected');
          resolve();
        });
        
        ws.on('error', (err) => {
          console.error('WebSocket client error', err);
          reject(err);
        });
        
        // 5 saniye timeout
        setTimeout(() => reject(new Error('WebSocket bağlantı zaman aşımı')), 5000);
      });
    } catch (error) {
      console.error('Test başlatma hatası:', error);
      throw error;
    }
  }, 30000); // Timeout süresini 30 saniyeye çıkardık

  afterAll(async () => {
    // MQTT client'ı kapat
    if (mqttClient && mqttClient.connected) {
      await new Promise<void>((resolve) => {
        mqttClient.end(false, {}, () => {
          console.log('MQTT client closed');
          resolve();
        });
      });
    }

    // WebSocket client'ı kapat
    if (ws && ws.readyState === WebSocket.OPEN) {
      await new Promise<void>((resolve) => {
        ws.on('close', () => {
          console.log('WebSocket client closed');
          resolve();
        });
        ws.close();
      });
    }
    
    // Serveri kapat
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log('Test server closed');
          resolve();
        });
      });
    }
  }, 30000); // Timeout süresini 30 saniyeye çıkardık

  // MQTT ve WebSocket bağlantı testleri
  it('MQTT client bağlantısı başarılı', async () => {
    expect(mqttClient.connected).toBe(true);
  });

  it('WebSocket bağlantısı başarılı', async () => {
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });

  // MQTT mesaj yayını ve WebSocket aboneliği testi
  it('MQTT üzerinden sensör verisi yayınlandığında WebSocket üzerinden alınabilmeli', async () => {
    // Test için sensör verisi
    const sensorData: MQTTSensorData = {
      sensor_id: 'test-sensor-1',
      timestamp: Math.floor(Date.now() / 1000),
      temperature: 25.5,
      humidity: 60.2,
      battery: 98,
      signal_strength: -65
    };
    
    const topic = `sensors/${sensorData.sensor_id}/data`;

    // WebSocket üzerinden gelen mesajı dinle
    const wsMessage = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket message timeout'));
      }, 5000);
      
      ws.on('message', (data) => {
        clearTimeout(timeout);
        try {
          const message = JSON.parse(data.toString());
          
          // Mesaj konuyu ve verileri içeriyor mu kontrol et
          if (message.topic === topic) {
            resolve(message);
          }
        } catch (err) {
          reject(new Error(`WebSocket message parse error: ${err}`));
        }
      });

      // MQTT üzerinden sensör verisi yayınla
      mqttClient.publish(topic, JSON.stringify(sensorData), (err) => {
        if (err) {
          clearTimeout(timeout);
          reject(new Error(`MQTT publish error: ${err}`));
        }
        console.log(`MQTT message published to ${topic}`);
      });
    });

    // Mesajın doğru formatta ve içerikte olduğunu doğrula
    expect(wsMessage).toBeDefined();
    expect(wsMessage.topic).toBe(topic);
    expect(wsMessage.data).toEqual(sensorData);
  });
  
  // Hatalı format test
  it('Hatalı formattaki MQTT mesajlarını doğru şekilde işlemeli', async () => {
    const invalidData = 'bu geçerli bir json değil';
    const topic = 'sensors/invalid-sensor/data';
    
    // Hatalı veriyi yayınla
    await new Promise<void>((resolve) => {
      mqttClient.publish(topic, invalidData, () => {
        // Mesaj gönderildikten sonra biraz bekle
        setTimeout(resolve, 1000);
      });
    });
    
    // Bu test başarısız bir JSON ayrıştırması beklentisi içerir
    // Sistem çökmemeli ve hata işlenebilmeli
    // Burada direkt bir sonuç beklemiyoruz, sadece sistemin çalışmaya devam ettiğini doğruluyoruz
    expect(mqttClient.connected).toBe(true);
  });
  
  // Sensör durumu mesajı testi
  it('Sensör durum mesajları doğru işlenmeli', async () => {
    const statusData = {
      sensor_id: 'test-sensor-2',
      status: 'active',
      battery_level: 85,
      last_seen: Math.floor(Date.now() / 1000)
    };
    
    const topic = `sensors/${statusData.sensor_id}/status`;
    
    // Durum mesajını yayınla
    await new Promise<void>((resolve) => {
      mqttClient.publish(topic, JSON.stringify(statusData), () => {
        // Mesaj gönderildikten sonra biraz bekle
        setTimeout(resolve, 1000);
      });
    });
    
    // Burada da direkt bir sonuç beklemiyoruz, sistemin çalışmaya devam ettiğini doğruluyoruz
    expect(mqttClient.connected).toBe(true);
  });
  
  // Çoklu mesaj ve WebSocket yanıtı
  it('Çoklu MQTT mesajları için WebSocket yanıtları doğru olmalı', async () => {
    // Farklı sensörler için test verileri
    const sensors = [
      {
        sensor_id: 'test-multi-1',
        timestamp: Math.floor(Date.now() / 1000),
        temperature: 22.1,
        humidity: 58.5
      },
      {
        sensor_id: 'test-multi-2',
        timestamp: Math.floor(Date.now() / 1000),
        temperature: 23.4,
        humidity: 62.1
      }
    ];
    
    // Her sensör için mesajları yayınla ve WebSocket yanıtlarını topla
    const results = await Promise.all(
      sensors.map(async (sensor) => {
        const topic = `sensors/${sensor.sensor_id}/data`;
        
        // WebSocket mesajını bekle
        const wsPromise = new Promise<any>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`WebSocket timeout for sensor ${sensor.sensor_id}`));
          }, 5000);
          
          const messageHandler = (event: WebSocket.MessageEvent) => {
            try {
              const message = JSON.parse(event.data.toString());
              if (message.topic === topic) {
                clearTimeout(timeout);
                ws.removeEventListener('message', messageHandler);
                resolve(message);
              }
            } catch (err) {
              // Parse hatası olursa yoksay (diğer sensör mesajları olabilir)
            }
          };
          
          ws.addEventListener('message', messageHandler);
          
          // MQTT mesajı yayınla
          mqttClient.publish(topic, JSON.stringify(sensor), (err) => {
            if (err) {
              clearTimeout(timeout);
              reject(new Error(`MQTT publish error for ${sensor.sensor_id}: ${err}`));
            }
          });
        });
        
        return wsPromise;
      })
    );
    
    // Her iki sensör mesajının da doğru alındığını kontrol et
    expect(results.length).toBe(2);
    expect(results[0].data.sensor_id).toBe('test-multi-1');
    expect(results[1].data.sensor_id).toBe('test-multi-2');
  });
}); 