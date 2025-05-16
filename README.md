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

## Mimari Tasarım

Bu uygulama, çok katmanlı bir mimari kullanarak geliştirilmiştir:

### Katmanlar

1. **Kontrolcüler (Controllers)** - İstemci isteklerini işler ve uygun hizmetleri çağırır
2. **Hizmetler (Services)** - İş mantığını içerir, modeller ile kontrolcüler arasında aracılık yapar
3. **Modeller (Models)** - Veritabanı etkileşimlerini yönetir, veri şeması ve veri erişim katmanı
4. **Rotalar (Routes)** - API endpoint'lerini tanımlar ve ilgili kontrolcülere yönlendirir
5. **Ara Yazılımlar (Middlewares)** - Kimlik doğrulama, yetkilendirme, log tutma gibi işlemleri gerçekleştirir
6. **Yardımcılar (Utils)** - Yardımcı fonksiyonlar, hata işleme, loglama vb.
7. **Tipler (Types)** - TypeScript tipleri ve arayüzleri

### Veri Akışı

```
İstemci İsteği → Rotalar → Ara Yazılımlar → Kontrolcüler → Hizmetler → Modeller → Veritabanı
```

### Asenkron İletişim

- **MQTT**: IoT sensörlerinden gerçek zamanlı veri alımı için
- **Socket.IO**: İstemcilere gerçek zamanlı veri yayını için

## API Belgelendirmesi

API belgelendirmesi Swagger UI ile otomatik olarak oluşturulmuştur ve çalışan uygulamada `/api-docs` endpoint'inden erişilebilir.

### Temel Endpoint'ler

#### Kimlik Doğrulama

- `POST /api/auth/register` - Yeni kullanıcı kaydı oluşturur
- `POST /api/auth/login` - Kullanıcı girişi yapar ve JWT token döndürür

#### Kullanıcı Yönetimi

- `GET /api/users/profile` - Giriş yapmış kullanıcının profilini getirir
- `GET /api/users` - Tüm kullanıcıları listeler (Sadece Admin rolü)
- `GET /api/users/:id` - Belirli bir kullanıcının bilgilerini getirir
- `PATCH /api/users/:id` - Kullanıcı bilgilerini günceller
- `DELETE /api/users/:id` - Kullanıcıyı siler

#### Şirket Yönetimi

- `GET /api/companies` - Tüm şirketleri listeler
- `GET /api/companies/:id` - Belirli bir şirketin bilgilerini getirir
- `POST /api/companies` - Yeni şirket oluşturur
- `PUT /api/companies/:id` - Şirket bilgilerini günceller
- `DELETE /api/companies/:id` - Şirketi siler

#### Sensör Yönetimi

- `GET /api/sensors` - Tüm sensörleri listeler
- `GET /api/sensors/:id` - Belirli bir sensörün bilgilerini getirir
- `POST /api/sensors` - Yeni sensör ekler
- `PUT /api/sensors/:id` - Sensör bilgilerini günceller
- `DELETE /api/sensors/:id` - Sensörü siler
- `GET /api/sensors/:id/data` - Sensör verilerini getirir

#### Loglama ve Raporlama

- `GET /api/logs` - Kullanıcı log kayıtlarını getirir
- `GET /api/logs/actions` - Log eylem tiplerini listeler
- `GET /api/logs/actions/:action` - Belirli bir eylem tipine ait logları getirir
- `GET /api/logs/analytics` - Log kayıtlarının analizini getirir
- `GET /api/system-logs` - Sistem log dosyalarını getirir (Sadece System Admin)

Her endpoint'in tam açıklaması ve örnek istek/yanıt yapıları için `/api-docs` endpoint'ini ziyaret edebilirsiniz.

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

## Deployment Rehberi

Bu uygulama, bir Docker konteyneri olarak veya geleneksel bir Node.js uygulaması olarak dağıtılabilir.

### Docker ile Deployment

1. Docker ve Docker Compose'un yüklü olduğundan emin olun.

2. Projeye eklenen `Dockerfile` ve `docker-compose.yml` dosyalarını kullanın:

   ```bash
   # Uygulamayı build edin ve başlatın
   docker-compose up -d
   ```

   Bu komut, PostgreSQL veritabanı, MQTT broker ve Node.js uygulamasını içeren konteynerler oluşturacaktır.

3. Uygulamaya `http://localhost:3000` adresinden erişebilirsiniz.

### Geleneksel Deployment

1. Üretim ortamı için bağımlılıkları yükleyin:
   ```bash
   npm ci --production
   ```

2. TypeScript kodunu derleyin:
   ```bash
   npm run build
   ```

3. Uygulamayı başlatın:
   ```bash
   NODE_ENV=production npm start
   ```

4. PM2 ile sürekli çalışmasını sağlayın (önerilen):
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name patrion-api
   ```

### Önerilen Sistem Gereksinimleri

- 2 CPU çekirdeği
- 2GB RAM
- 20GB disk alanı
- Ubuntu 18.04 LTS veya üzeri

### Ölçeklendirme

Yüksek trafikli ortamlarda:

1. Veritabanını ayrı bir sunucuya taşıyın
2. Load balancer arkasında birden fazla API sunucusu çalıştırın
3. Redis ile önbellek ekleyin
4. MQTT broker'ı ölçeklendirin (örn. HiveMQ veya RabbitMQ)

## Yapılacak İşler

- [x] Kullanıcı CRUD işlemleri
- [ ] Ürün CRUD işlemleri
- [ ] Sipariş yönetimi
- [ ] Kapsamlı testler
- [x] Dokümantasyon geliştirme
- [x] Kullanıcı yetkilendirme sistemi
- [x] Loglama sistemi
- [ ] CI/CD entegrasyonu

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 