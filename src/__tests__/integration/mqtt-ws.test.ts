import { WebSocket } from 'ws';
import mqtt from 'mqtt';
import { startServer, closeServer } from '../../index';
import { publishMessage, closeMqttClient } from '../../services/mqtt.service';

// Test süresi uzun olabilir, timeout'u artıralım
jest.setTimeout(30000);

describe('MQTT ve WebSocket Entegrasyon Testleri', () => {
  let wsClient: WebSocket;
  let mqttClient: mqtt.MqttClient;
  
  beforeAll(async () => {
    // Sunucuyu başlat
    await startServer();
  });
  
  afterAll(async () => {
    // MQTT bağlantısını kapat
    if (mqttClient) {
      mqttClient.end(true);
    }
    
    // WebSocket bağlantısını kapat
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.close();
    }
    
    // MQTT istemcisini kapat
    closeMqttClient();
    
    // Sunucuyu kapat
    closeServer();
  });
  
  test('WebSocket istemcisi bağlantı kurabilmeli', (done) => {
    wsClient = new WebSocket('ws://localhost:3000/sensors');
    
    wsClient.on('open', () => {
      expect(wsClient.readyState).toBe(WebSocket.OPEN);
      done();
    });
    
    wsClient.on('error', (error) => {
      done(error);
    });
  });
  
  test('WebSocket istemcisi sensör verisi alabilmeli', (done) => {
    if (wsClient.readyState !== WebSocket.OPEN) {
      wsClient = new WebSocket('ws://localhost:3000/sensors');
      
      wsClient.on('open', () => {
        runTest();
      });
    } else {
      runTest();
    }
    
    function runTest() {
      // WebSocket'ten veri almak için dinleyici ekle
      wsClient.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          expect(message).toHaveProperty('sensor_id');
          expect(message).toHaveProperty('timestamp');
          done();
        } catch (error) {
          done(error);
        }
      });
      
      // Test amaçlı sensör verisi yayınla
      const testData = {
        sensor_id: 'test_sensor_001',
        timestamp: Math.floor(Date.now() / 1000),
        temperature: 23.5,
        humidity: 45
      };
      
      // MQTT servisimiz üzerinden doğrudan yayın yapalım
      publishMessage('sensors/test_sensor_001/data', testData);
    }
  });
  
  test('MQTT istemcisi bağlantı kurabilmeli', (done) => {
    mqttClient = mqtt.connect('mqtt://localhost:1883', {
      clientId: 'test_client_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      connectTimeout: 5000
    });
    
    mqttClient.on('connect', () => {
      expect(mqttClient.connected).toBe(true);
      done();
    });
    
    mqttClient.on('error', (error) => {
      done(error);
    });
  });
  
  test('MQTT istemcisi sensör verisi yayınlayabilmeli', (done) => {
    if (!mqttClient || !mqttClient.connected) {
      done(new Error('MQTT istemcisi bağlı değil'));
      return;
    }
    
    const testData = {
      sensor_id: 'test_sensor_002',
      timestamp: Math.floor(Date.now() / 1000),
      temperature: 25.8,
      humidity: 52
    };
    
    mqttClient.publish('sensors/test_sensor_002/data', JSON.stringify(testData), (error) => {
      if (error) {
        done(error);
      } else {
        // Yayın başarılı
        done();
      }
    });
  });
}); 