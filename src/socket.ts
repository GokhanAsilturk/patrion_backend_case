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

export { io }; 