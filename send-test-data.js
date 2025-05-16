const mqtt = require('mqtt');
const fs = require('fs');
const readline = require('readline');

const MQTT_BROKER = 'mqtt://localhost:1883';
const DEFAULT_TOPIC = 'sensors/sensor1/status';

// Örnek sensör verileri
const DEFAULT_DATA = {
  sensor_id: 'sensor1',
  timestamp: Math.floor(Date.now() / 1000),
  temperature: 25.4,
  humidity: 55.2
};

const client = mqtt.connect(MQTT_BROKER);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function displayMenu() {
  console.log('\n===== MQTT Sensör Test Verisi Gönderme Aracı =====');
  console.log('1. Varsayılan test verisi gönder');
  console.log('2. Özel sensör ID ile veri gönder');
  console.log('3. Özel sıcaklık ve nem değerleri ile veri gönder');
  console.log('4. Çoklu veri gönder (1000 örnek)');
  console.log('5. JSON dosyasından veri gönder');
  console.log('6. Çıkış');
  console.log('================================================\n');
  
  rl.question('Seçiminiz (1-6): ', handleMenuSelection);
}

function handleMenuSelection(choice) {
  switch (choice) {
    case '1':
      sendDefaultData();
      break;
    case '2':
      sendWithCustomSensorId();
      break;
    case '3':
      sendWithCustomValues();
      break;
    case '4':
      sendMultipleData();
      break;
    case '5':
      sendFromJsonFile();
      break;
    case '6':
      console.log('Program sonlandırılıyor...');
      client.end();
      rl.close();
      return;
    default:
      console.log('Geçersiz seçim. Lütfen 1-6 arası bir değer girin.');
      displayMenu();
      return;
  }
}

function sendDefaultData() {
  const data = { ...DEFAULT_DATA, timestamp: Math.floor(Date.now() / 1000) };
  client.publish(DEFAULT_TOPIC, JSON.stringify(data), (err) => {
    if (err) {
      console.error('Veri gönderme hatası:', err);
    } else {
      console.log('Varsayılan veri gönderildi:', data);
    }
    displayMenu();
  });
}

function sendWithCustomSensorId() {
  rl.question('Sensör ID girin: ', (sensorId) => {
    const topic = `sensors/${sensorId}/status`;
    const data = { 
      ...DEFAULT_DATA, 
      sensor_id: sensorId,
      timestamp: Math.floor(Date.now() / 1000) 
    };
    
    client.publish(topic, JSON.stringify(data), (err) => {
      if (err) {
        console.error('Veri gönderme hatası:', err);
      } else {
        console.log(`Veri "${topic}" konusuna gönderildi:`, data);
      }
      displayMenu();
    });
  });
}

function sendWithCustomValues() {
  rl.question('Sensör ID girin: ', (sensorId) => {
    rl.question('Sıcaklık değeri girin: ', (temp) => {
      rl.question('Nem değeri girin: ', (humidity) => {
        const topic = `sensors/${sensorId}/status`;
        const data = {
          sensor_id: sensorId,
          timestamp: Math.floor(Date.now() / 1000),
          temperature: parseFloat(temp),
          humidity: parseFloat(humidity)
        };
        
        client.publish(topic, JSON.stringify(data), (err) => {
          if (err) {
            console.error('Veri gönderme hatası:', err);
          } else {
            console.log(`Özel değerlerle veri gönderildi:`, data);
          }
          displayMenu();
        });
      });
    });
  });
}

function sendMultipleData() {
  rl.question('Kaç adet veri göndermek istiyorsunuz? (max: 1000): ', (count) => {
    const numCount = parseInt(count) || 10;
    const actualCount = Math.min(numCount, 1000);
    
    console.log(`${actualCount} adet veri gönderiliyor...`);
    let sent = 0;
    
    for (let i = 0; i < actualCount; i++) {
      const data = {
        sensor_id: 'sensor1',
        timestamp: Math.floor(Date.now() / 1000) - (actualCount - i) * 60, 
        temperature: (20 + Math.random() * 10).toFixed(1),
        humidity: (40 + Math.random() * 20).toFixed(1)
      };
      
      client.publish(DEFAULT_TOPIC, JSON.stringify(data), () => {
        sent++;
        if (sent === actualCount) {
          console.log(`${actualCount} veri başarıyla gönderildi.`);
          displayMenu();
        }
      });
    }
  });
}

function sendFromJsonFile() {
  rl.question('JSON dosya yolunu girin: ', (filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(`Hata: "${filePath}" dosyası bulunamadı.`);
        displayMenu();
        return;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let jsonData;
      
      try {
        jsonData = JSON.parse(fileContent);
      } catch (e) {
        console.error('JSON ayrıştırma hatası:', e.message);
        displayMenu();
        return;
      }
      
      if (Array.isArray(jsonData)) {
        let sent = 0;
        const total = jsonData.length;
        
        jsonData.forEach((data, index) => {
          if (!data.timestamp) {
            data.timestamp = Math.floor(Date.now() / 1000) - (total - index) * 60;
          }
          
          const topic = `sensors/${data.sensor_id || 'sensor1'}/status`;
          
          client.publish(topic, JSON.stringify(data), () => {
            sent++;
            if (sent === total) {
              console.log(`${total} veri dosyadan başarıyla gönderildi.`);
              displayMenu();
            }
          });
        });
      } else {
        if (!jsonData.timestamp) {
          jsonData.timestamp = Math.floor(Date.now() / 1000);
        }
        
        const topic = `sensors/${jsonData.sensor_id || 'sensor1'}/status`;
        
        client.publish(topic, JSON.stringify(jsonData), (err) => {
          if (err) {
            console.error('Veri gönderme hatası:', err);
          } else {
            console.log('Dosyadan veri gönderildi:', jsonData);
          }
          displayMenu();
        });
      }
    } catch (error) {
      console.error('Dosya okuma hatası:', error.message);
      displayMenu();
    }
  });
}

client.on('connect', () => {
  console.log('MQTT broker\'a bağlanıldı.');
  displayMenu();
});

client.on('error', (err) => {
  console.error('MQTT bağlantı hatası:', err);
  rl.close();
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nProgram sonlandırılıyor...');
  client.end();
  rl.close();
  process.exit(0);
}); 