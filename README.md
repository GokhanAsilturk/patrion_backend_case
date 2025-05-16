# Patrion Backend Case

Bu proje, Patrion Backend Case çalışması için geliştirilmiş bir REST API uygulamasıdır.

## Teknolojiler

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT (JSON Web Token)
- REST API
- MQTT (Sensör verisi alımı için)
- Socket.IO (Gerçek zamanlı veri yayını için)

## Başlangıç

Bu talimatlar, projeyi yerel makinenizde geliştirme ve test amacıyla çalıştırmanız için bir kopya almanıza yardımcı olacaktır.

### Önkoşullar

- Node.js (v14 veya üzeri)
- npm (v6 veya üzeri)
- PostgreSQL
- MQTT Broker (Eclipse Mosquitto önerilir)

### Kurulum

1. Repoyu klonlayın:
   ```
   git clone <repo-url>
   cd patrion-backend-case
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `.env` dosyasını oluşturun ve gerekli ortam değişkenlerini doldurun:
   ```
   PORT=3000
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=patrion_case
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   
   # MQTT
   MQTT_BROKER=mqtt://localhost:1883
   MQTT_USERNAME=your_mqtt_user
   MQTT_PASSWORD=your_mqtt_password
   MQTT_CLIENT_ID=patrion_sensor_tracker
   ```

4. PostgreSQL veritabanını oluşturun:
   ```
   createdb patrion_case
   ```

5. Mosquitto MQTT broker kurulumu (Ubuntu/Debian):
   ```
   sudo apt-get install mosquitto mosquitto-clients
   sudo systemctl start mosquitto
   ```
   
   Windows için [Mosquitto İndirme Sayfası](https://mosquitto.org/download/)

6. Uygulamayı geliştirme modunda başlatın:
   ```
   npm run dev
   ```

## MQTT Entegrasyonu

Sistem, sensörlerden veri almak için MQTT protokolünü kullanır. Sensörler aşağıdaki formatta veri yayınlar:

### MQTT Konuları (Topics)

- `sensors/{sensor_id}/data` - Sensör verisi
- `sensors/{sensor_id}/status` - Sensör durum bilgisi

### Veri Formatı

Sensörlerden gelen veriler aşağıdaki JSON formatında olmalıdır:

```json
{
  "sensor_id": "sens-001",
  "timestamp": 1621234567,
  "temperature": 24.5,
  "humidity": 65.7,
  "location": {
    "lat": 41.0082,
    "lng": 28.9784
  }
}
```

### Test Veri Yayını

MQTT broker'a test veri göndermek için:

```bash
mosquitto_pub -h localhost -t "sensors/sens-001/data" -m '{"sensor_id": "sens-001", "timestamp": 1621234567, "temperature": 24.5, "humidity": 65.7, "pressure": 1013.2}'
```

## Socket.IO Entegrasyonu

Gerçek zamanlı sensör verilerini istemcilere iletmek için Socket.IO kullanılır.

### Bağlantı Kurma

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Odalara Katılma

```javascript
socket.emit('join_company', companyId);

socket.emit('join_sensor', sensorId);
```

### Veri Dinleme

```javascript
socket.on(`sensor/${sensorId}/data`, (data) => {
  console.log('Yeni sensör verisi:', data);
});
```

## API Belgelendirmesi

### Kimlik Doğrulama Endpoint'leri

#### Kullanıcı Kaydı
- **URL**: `/api/auth/register`
- **Metod**: `POST`
- **Veri**:
  ```json
  {
    "username": "kullanici",
    "email": "kullanici@ornek.com",
    "password": "sifre123",
    "fullName": "Ad Soyad"
  }
  ```
- **Başarılı Yanıt**:
  ```json
  {
    "status": "success",
    "message": "Kullanıcı başarıyla kaydedildi",
    "data": {
      "user": {
        "id": 1,
        "username": "kullanici",
        "email": "kullanici@ornek.com",
        "fullName": "Ad Soyad",
        "role": "user",
        "token": "jwt_token"
      }
    }
  }
  ```

#### Kullanıcı Girişi
- **URL**: `/api/auth/login`
- **Metod**: `POST`
- **Veri**:
  ```json
  {
    "email": "kullanici@ornek.com",
    "password": "sifre123"
  }
  ```
- **Başarılı Yanıt**:
  ```json
  {
    "status": "success",
    "message": "Giriş başarılı",
    "data": {
      "user": {
        "id": 1,
        "username": "kullanici",
        "email": "kullanici@ornek.com",
        "fullName": "Ad Soyad",
        "role": "user",
        "token": "jwt_token"
      }
    }
  }
  ```

### Kullanıcı Endpoint'leri

#### Kullanıcı Profili
- **URL**: `/api/users/profile`
- **Metod**: `GET`
- **Kimlik Doğrulama**: `Bearer Token`
- **Başarılı Yanıt**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": 1,
        "username": "kullanici",
        "email": "kullanici@ornek.com",
        "fullName": "Ad Soyad",
        "role": "user"
      }
    }
  }
  ```

#### Tüm Kullanıcıları Listeleme (Sadece Admin)
- **URL**: `/api/users`
- **Metod**: `GET`
- **Kimlik Doğrulama**: `Bearer Token` (Admin rolü gerekli)
- **Başarılı Yanıt**:
  ```json
  {
    "status": "success",
    "results": 2,
    "data": {
      "users": [
        {
          "id": 1,
          "username": "admin",
          "email": "admin@ornek.com",
          "fullName": "Admin Kullanıcı",
          "role": "admin"
        },
        {
          "id": 2,
          "username": "kullanici",
          "email": "kullanici@ornek.com",
          "fullName": "Normal Kullanıcı",
          "role": "user"
        }
      ]
    }
  }
  ```

## Yapılacak İşler

- [x] Kullanıcı CRUD işlemleri
- [ ] Ürün CRUD işlemleri
- [ ] Sipariş yönetimi
- [ ] Kapsamlı testler
- [ ] Dokümantasyon geliştirme
- [x] Kullanıcı yetkilendirme sistemi
- [x] Loglama sistemi
- [ ] CI/CD entegrasyonu

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 