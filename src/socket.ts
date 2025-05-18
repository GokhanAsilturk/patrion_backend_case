import http from 'http';
import { Server } from 'socket.io';
import { authenticateSocket } from './middlewares/auth.middleware';
import { createUserLog } from './models/log.model';
import { LogAction } from './types/log';

let io: Server | null = null;

export const initSocketIO = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: '*', // Üretim ortamında kısıtlanmalıdır
      methods: ['GET', 'POST']
    }
  });
  
  // JWT ile doğrulama middleware
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    try {
      const userId = socket.data.user?.id;
      const username = socket.data.user?.username;
      
      console.log(`Kullanıcı bağlandı: ${username} (${userId})`);
      
      // Kullanıcı log kaydı
      if (userId) {
        await createUserLog({
          user_id: userId,
          action: LogAction.VIEWED_SENSOR_DATA,
          details: {
            connection_id: socket.id,
            ip_address: socket.handshake.address
          },
          ip_address: socket.handshake.address
        });
      }
      
      // Odaya katılma
      socket.on('join_company', (companyId) => {
        socket.join(`company_${companyId}`);
        console.log(`${username} kullanıcısı company_${companyId} odasına katıldı`);
      });
      
      socket.on('join_sensor', (sensorId) => {
        socket.join(`sensor_${sensorId}`);
        console.log(`${username} kullanıcısı sensor_${sensorId} odasına katıldı`);
      });
      
      // YENİ: Sensör verisi yayınlama endpoint'i
      socket.on('publish_sensor_data', (data) => {
        const { sensorId, readings } = data;
        if (!sensorId || !readings) {
          socket.emit('error', { message: 'Geçersiz sensör verisi formatı' });
          return;
        }
        
        // Sensör odasına veri yayınlama
        io?.to(`sensor_${sensorId}`).emit('sensor_data_update', {
          sensorId,
          readings,
          timestamp: new Date().toISOString()
        });
        
        // İlgili şirkete bildirim gönderme (sensör şirket ilişkisi varsa)
        if (data.companyId) {
          io?.to(`company_${data.companyId}`).emit('sensor_activity', {
            sensorId,
            type: 'data_update',
            timestamp: new Date().toISOString()
          });
        }
        
        console.log(`Sensör verisi yayınlandı: sensor_${sensorId}`);
      });
      
      // YENİ: Bildirim gönderme endpoint'i
      socket.on('send_notification', (data) => {
        const { targetType, targetId, notificationType, message } = data;
        
        if (!targetType || !targetId || !notificationType) {
          socket.emit('error', { message: 'Geçersiz bildirim formatı' });
          return;
        }
        
        const notificationData = {
          type: notificationType,
          message: message || 'Yeni bildirim',
          timestamp: new Date().toISOString(),
          senderId: userId
        };
        
        // Hedef tipine göre odaya bildirim gönderme
        if (targetType === 'company') {
          io?.to(`company_${targetId}`).emit('notification', notificationData);
          console.log(`Şirket bildirimi gönderildi: company_${targetId}`);
        } else if (targetType === 'sensor') {
          io?.to(`sensor_${targetId}`).emit('notification', notificationData);
          console.log(`Sensör bildirimi gönderildi: sensor_${targetId}`);
        } else if (targetType === 'user' && targetId) {
          // Kullanıcıya özel bildirim - burada kullanıcının aktif soket bağlantısını bulmak gerekebilir
          // Bu örnek basitleştirilmiştir, gerçek uygulamada kullanıcı-soket eşleştirmesi gerekecek
          console.log(`Kullanıcı bildirimi gönderildi: ${targetId}`);
        }
      });
      
      // Bağlantı kopma
      socket.on('disconnect', () => {
        console.log(`Kullanıcı ayrıldı: ${username} (${userId})`);
      });
    } catch (error) {
      console.error('Socket bağlantısında hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
  });
  
  return io;
};

// YENİ: Programatik olarak sensör verisi yayınlama yardımcı fonksiyonu
export const publishSensorData = (sensorId: string, readings: any, companyId?: string) => {
  if (!io) {
    console.error('Socket.IO henüz başlatılmadı');
    return false;
  }
  
  io.to(`sensor_${sensorId}`).emit('sensor_data_update', {
    sensorId,
    readings,
    timestamp: new Date().toISOString()
  });
  
  if (companyId) {
    io.to(`company_${companyId}`).emit('sensor_activity', {
      sensorId,
      type: 'data_update',
      timestamp: new Date().toISOString()
    });
  }
  
  return true;
};

export { io }; 