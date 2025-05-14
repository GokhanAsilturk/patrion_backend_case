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
import { httpLogger } from './middlewares/logger.middleware';
import { log } from './utils/logger';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './utils/swagger';

// Environment variables
dotenv.config();

// Express uygulaması
const app: Application = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(httpLogger);

// Initialize database tables
const initDatabase = async () => {
  try {
    // İlk önce şirket tablosunu oluştur
    await createCompaniesTable();
    log.info('Şirket tablosu başarıyla oluşturuldu');
    
    // Sonra kullanıcı tablosunu oluştur (bu tabloda company_id foreign key'i var)
    await createUsersTable();
    log.info('Kullanıcı tablosu başarıyla oluşturuldu');
    
    // Sensör tablolarını oluştur
    await createSensorsTable();
    log.info('Sensör tablosu başarıyla oluşturuldu');
    
    await createSensorDataTable();
    log.info('Sensör veri tablosu başarıyla oluşturuldu');
    
    // Son olarak log tablosunu oluştur
    await createUserLogsTable();
    log.info('Kullanıcı log tablosu başarıyla oluşturuldu');
    
    log.info('Veritabanı tabloları başarıyla oluşturuldu');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('Veritabanı tabloları oluşturulurken hata', { error: errorMessage });
    console.error('Veritabanı hata:', errorMessage);
  }
};

// API Routes
app.use('/api', routes);

// Swagger documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Ana sayfa
app.get('/', (req: Request, res: Response) => {
  res.redirect('/api-docs');
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Sayfa bulunamadı'
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  log.error('Uygulama hatası', { 
    error: err.message || 'Bilinmeyen hata', 
    stack: err.stack,
    path: req.path, 
    method: req.method 
  });
  
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Sunucu hatası';
  
  res.status(statusCode).json({
    status: 'error',
    message: errorMessage
  });
});

// HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Start server
server.listen(PORT, async () => {
  log.info(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  
  // Initialize database tables
  await initDatabase();
  
  // Initialize MQTT client
  initMqttClient();
});

// Handle process termination
process.on('SIGTERM', () => {
  log.info('SIGTERM sinyali alındı. Sunucu kapatılıyor.');
  server.close(() => {
    log.info('HTTP sunucusu kapatıldı.');
    process.exit(0);
  });
});

export default server; 