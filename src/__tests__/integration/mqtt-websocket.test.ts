import * as mqtt from 'mqtt';
import WebSocket from 'ws';
import http from 'http';
import express from 'express';
import { AddressInfo } from 'net';
import { closeServer } from '../../index';
import config from '../../config/config';
import { initSocketIO } from '../../socket';

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

// Bu testler gerçek MQTT broker ve WebSocket server gerektirdiği için şu an skip ediyoruz
describe.skip('MQTT ve WebSocket Testleri', () => {
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

  // MQTT mesajı gönderme ve WebSocket üzerinden alma testi
  it('MQTT mesajı gönderme ve WebSocket üzerinden alma', async () => {
    // MQTT üzerinden bir sensör verisi gönder
    const sensorData = {
      id: 1,
      value: 25.5,
      timestamp: new Date().toISOString()
    };

    // WebSocket üzerinden gelen mesajı dinle
    const wsMessage = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket message timeout'));
      }, 5000);
      
      ws.on('message', (data) => {
        clearTimeout(timeout);
        try {
          const message = JSON.parse(data.toString());
          resolve(message);
        } catch (err) {
          reject(new Error(`WebSocket message parse error: ${err}`));
        }
      });

      // Sensör verisi gönder
      mqttClient.publish('sensors/1/data', JSON.stringify(sensorData), (err) => {
        if (err) {
          clearTimeout(timeout);
          reject(new Error(`MQTT publish error: ${err}`));
        }
        console.log('MQTT message published');
      });
    });

    // Timeout ekle
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Mesajın doğru formatta ve içerikte olduğunu doğrula
    expect(wsMessage).toBeDefined();
    expect(wsMessage.topic).toBe('sensors/1/data');
    expect(wsMessage.data).toEqual(sensorData);
  });

  it('MQTT client yayınları alabiliyor', async () => {
    expect(mqttClient.connected).toBe(true);
  });

  it('WebSocket bağlantısı doğru çalışıyor', async () => {
    expect(ws.readyState).toBe(WebSocket.OPEN);
  });
}); 