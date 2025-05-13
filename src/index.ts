import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import config from './config/config';
import routes from './routes';
import { initMqttClient } from './services/mqtt.service';
import { initSocketIO } from './socket';
import { createUsersTable } from './models/user.model';
import { createCompaniesTable } from './models/company.model';
import { createSensorsTable, createSensorDataTable } from './models/sensor.model';
import { createUserLogsTable } from './models/log.model';

// Environment variables
dotenv.config();

// Express app
const app: Application = express();
const PORT = config.port;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database tables
const initDatabase = async () => {
  try {
    await createCompaniesTable();
    await createUsersTable();
    await createSensorsTable().catch(err => {
      console.log('Sensör tablosu oluşturulurken hata, şirket tablosu önce oluşturulmalıdır:', err.message);
    });
    await createSensorDataTable().catch(err => {
      console.log('Sensör veri tablosu oluşturulurken hata, sensör tablosu önce oluşturulmalıdır:', err.message);
    });
    await createUserLogsTable().catch(err => {
      console.log('Kullanıcı log tablosu oluşturulurken hata, kullanıcı tablosu önce oluşturulmalıdır:', err.message);
    });
    console.log('Veritabanı tabloları başarıyla oluşturuldu');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Veritabanı tabloları oluşturulurken hata:', errorMessage);
  }
};

// Routes
app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.send('Akıllı Sensör Takip Sistemi API - Hoş Geldiniz!');
});

// HTTP Server oluştur
const server = http.createServer(app);

// Start server
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Initialize database
  await initDatabase();
  
  // WebSocket sunucusunu başlat
  initSocketIO(server);
  
  // MQTT istemcisini başlat
  initMqttClient();
  
  console.log('WebSocket ve MQTT servisleri başlatıldı');
});

// Uygulama kapatıldığında temiz bir şekilde kaynaklarımızı bırakalım
const gracefulShutdown = () => {
  console.log('Uygulama kapatılıyor...');
  
  // MQTT bağlantısını kapat
  try {
    const { closeMqttClient } = require('./services/mqtt.service');
    closeMqttClient();
  } catch (error) {
    console.error('MQTT bağlantısı kapatılırken hata:', error instanceof Error ? error.message : String(error));
  }
  
  // HTTP sunucusunu kapat
  server.close(() => {
    console.log('HTTP sunucusu kapatıldı');
    process.exit(0);
  });
  
  // 10 saniye sonra zorla kapat
  setTimeout(() => {
    console.error('Graceful shutdown başarısız! Zorla kapatılıyor...');
    process.exit(1);
  }, 10000);
};

// Sinyalleri dinle
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app; 