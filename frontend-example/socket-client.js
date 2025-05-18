// socket.io-client kütüphanesini yüklemeniz gerekiyor
// npm install socket.io-client

import { io } from 'socket.io-client';

// JWT token'ınız
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Gerçek JWT token'ınızı kullanın

// Socket.IO bağlantısı
export const connectSocket = () => {
  // API sunucunuzun URL'si
  const socket = io('http://localhost:3000', {
    auth: {
      token
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Bağlantı olayları
  socket.on('connect', () => {
    console.log('Socket.IO sunucusuna bağlandı');
    
    // Belirli bir sensör odasına katılma
    socket.emit('join_sensor', '123');
    
    // Belirli bir şirket odasına katılma
    socket.emit('join_company', '456');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO bağlantı hatası:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.IO bağlantısı kesildi:', reason);
  });

  // Sensör veri güncellemelerini dinleme
  socket.on('sensor_data_update', (data) => {
    console.log('Yeni sensör verisi alındı:', data);
    // Arayüzü güncelle - örneğin grafik veya sayaçları
    updateUI(data);
  });

  // Sensör aktivite bildirimlerini dinleme
  socket.on('sensor_activity', (data) => {
    console.log('Sensör aktivitesi:', data);
    // Aktivite bildirimi göster
    showActivityNotification(data);
  });

  // Genel bildirimleri dinleme
  socket.on('notification', (data) => {
    console.log('Bildirim alındı:', data);
    // Bildirim göster
    showNotification(data);
  });

  // Hata mesajlarını dinleme
  socket.on('error', (error) => {
    console.error('Socket.IO hatası:', error);
    // Kullanıcıya hata göster
    showErrorToUser(error);
  });

  return socket;
};

// Sensör verisi yayınlama örneği
export const publishSensorData = (socket, sensorId, readings, companyId) => {
  socket.emit('publish_sensor_data', {
    sensorId,
    readings,
    companyId
  });
};

// Bildirim gönderme örneği
export const sendNotification = (socket, targetType, targetId, notificationType, message) => {
  socket.emit('send_notification', {
    targetType,
    targetId,
    notificationType,
    message
  });
};

// Arayüz güncelleme fonksiyonu (örnek)
const updateUI = (data) => {
  // Grafik veya sayaç güncelleme kodu
  // Örnek:
  if (document.getElementById(`sensor-${data.sensorId}`)) {
    const element = document.getElementById(`sensor-${data.sensorId}`);
    
    if (data.readings.temperature) {
      element.querySelector('.temperature').textContent = `${data.readings.temperature}°C`;
    }
    
    if (data.readings.humidity) {
      element.querySelector('.humidity').textContent = `${data.readings.humidity}%`;
    }
    
    element.querySelector('.last-update').textContent = new Date(data.timestamp).toLocaleString();
  }
};

// Aktivite bildirimi gösterme fonksiyonu (örnek)
const showActivityNotification = (data) => {
  // Aktivite bildirimi gösterme kodu
  const notification = document.createElement('div');
  notification.className = 'activity-notification';
  notification.innerHTML = `
    <div class="sensor-activity">
      <strong>Sensör Aktivitesi</strong>
      <p>Sensör ID: ${data.sensorId}</p>
      <p>Tip: ${data.type}</p>
      <p>Zaman: ${new Date(data.timestamp).toLocaleString()}</p>
    </div>
  `;
  
  document.getElementById('notifications-container').appendChild(notification);
  
  // 5 saniye sonra bildirimi kaldır
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

// Bildirim gösterme fonksiyonu (örnek)
const showNotification = (data) => {
  // Notification API kullanarak bildirim göster
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Sensör Bildirimi', {
      body: data.message,
      icon: '/path/to/notification-icon.png'
    });
  }
  
  // veya UI'da bir toast mesajı göster
  const toast = document.createElement('div');
  toast.className = `toast toast-${data.type || 'info'}`;
  toast.innerHTML = `
    <div class="toast-header">
      <strong>${data.type || 'Bildirim'}</strong>
      <small>${new Date(data.timestamp).toLocaleString()}</small>
    </div>
    <div class="toast-body">
      ${data.message}
    </div>
  `;
  
  document.getElementById('toast-container').appendChild(toast);
  
  // 5 saniye sonra toast'u kaldır
  setTimeout(() => {
    toast.remove();
  }, 5000);
};

// Hata mesajı gösterme fonksiyonu (örnek)
const showErrorToUser = (error) => {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.innerHTML = `
    <div class="alert alert-danger">
      <strong>Hata!</strong> ${error.message || 'Bilinmeyen bir hata oluştu'}
    </div>
  `;
  
  document.getElementById('error-container').appendChild(errorElement);
  
  // 10 saniye sonra hata mesajını kaldır
  setTimeout(() => {
    errorElement.remove();
  }, 10000);
}; 