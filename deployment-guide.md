# Akıllı Sensör Takip Sistemi Deployment Rehberi

Bu rehber, Akıllı Sensör Takip Sistemi'nin yerel ortamda ve üretim ortamında nasıl çalıştırılacağını adım adım açıklar.

## İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Yerel Geliştirme Ortamı](#yerel-geliştirme-ortamı)
3. [Docker ile Çalıştırma](#docker-ile-çalıştırma)
4. [Üretim Ortamına Deployment](#üretim-ortamına-deployment)
5. [MQTT Testi](#mqtt-testi)
6. [WebSocket Testi](#websocket-testi)
7. [Sorun Giderme](#sorun-giderme)

## Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- PostgreSQL
- InfluxDB
- Eclipse Mosquitto (MQTT broker)
- Docker ve Docker Compose (isteğe bağlı, ama önerilen)

## Yerel Geliştirme Ortamı

### 1. Repo'yu Klonla

```bash
git clone https://github.com/kullanici/patrion_backend_case.git
cd patrion_backend_case
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. .env Dosyasını Oluştur

Proje dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri ayarlayın:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=patrion_case

# JWT Configuration
JWT_SECRET=patrion_jwt_secret_key
JWT_EXPIRES_IN=1d

# MQTT Configuration
MQTT_BROKER=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_CLIENT_ID=patrion_sensor_tracker

# InfluxDB Configuration
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=my-token
INFLUX_ORG=my-org
INFLUX_BUCKET=sensor_data
```

### 4. Veritabanlarını Başlat

PostgreSQL ve InfluxDB veritabanlarını başlatın ve gerekli şemaları oluşturun:

```bash
# PostgreSQL Veritabanı Oluştur
createdb patrion_case

# InfluxDB Kurulum ve Yapılandırma için resmi dokümantasyonu takip edin
# https://docs.influxdata.com/influxdb/v2/install/
```

### 5. Uygulamayı Başlat

```bash
# Development Modunda Başlat
npm run dev

# Veya
npm run build
npm start
```

## Docker ile Çalıştırma

Docker ile tüm bileşenleri (uygulama, PostgreSQL, InfluxDB, Mosquitto) tek seferde başlatabilirsiniz.

### 1. Docker Compose ile Başlat

```bash
docker-compose up -d
```

Bu komut, `docker-compose.yml` dosyasında tanımlanan tüm servisleri başlatır:
- Node.js uygulaması (API)
- PostgreSQL veritabanı
- InfluxDB
- Eclipse Mosquitto (MQTT broker)

### 2. Servisleri Kontrol Et

```bash
docker-compose ps
```

### 3. Logları İzle

```bash
docker-compose logs -f app
```

### 4. Servisleri Durdur

```bash
docker-compose down
```

## Üretim Ortamına Deployment

### 1. Sunucu Hazırlığı

Ubuntu 20.04 LTS sunucusuna Docker ve Docker Compose kurun:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

### 2. Proje Dosyalarını Sunucuya Kopyala

```bash
git clone https://github.com/kullanici/patrion_backend_case.git
cd patrion_backend_case
```

### 3. Üretim Ortamı Yapılandırması

`docker-compose.yml` dosyasında üretim ortamına özel ayarlamaları yapın:
- `JWT_SECRET` güvenli ve uzun bir değerle değiştirin
- `DB_PASSWORD` güçlü bir şifreyle değiştirin
- SSL/TLS için gerekli sertifikaları ekleyin

### 4. Uygulamayı Başlat

```bash
docker-compose up -d
```

### 5. Otomatik Yeniden Başlatmayı Ayarla

Sunucu yeniden başlatıldığında servislerin otomatik başlaması için `systemd` servisi oluşturun:

```bash
sudo nano /etc/systemd/system/patrion-case.service
```

İçeriği şu şekilde olmalıdır:

```
[Unit]
Description=Patrion Case Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/patrion_backend_case
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

Servisi etkinleştirin:

```bash
sudo systemctl enable patrion-case.service
sudo systemctl start patrion-case.service
```

## MQTT Testi

### MQTT.fx ile Test

1. [MQTT.fx](http://mqttfx.jensd.de/) indirin ve yükleyin
2. Connect > Connection Profile > New butonlarını tıklayın
3. Profil adı belirleyin (örn. "PatrionTest")
4. Broker Address: `localhost` (Docker ile `hostname` veya IP)
5. Broker Port: `1883`
6. Connect butonuna tıklayın
7. Publish sekmesine geçin ve aşağıdaki veriyi gönderin:

```json
Topic: sensor/data
QoS: 0
Payload:
{
  "sensor_id": "temp_sensor_01",
  "timestamp": 1710772800,
  "temperature": 25.4,
  "humidity": 55.2
}
```

### Mosquitto CLI ile Test

```bash
# MQTT yayını
mosquitto_pub -h localhost -t "sensor/data" -m '{"sensor_id":"temp_sensor_01","timestamp":1710772800,"temperature":25.4,"humidity":55.2}'

# MQTT aboneliği
mosquitto_sub -h localhost -t "sensor/data" -v
```

## WebSocket Testi

### Postman ile Test

1. Postman'i açın
2. New > WebSocket Request tıklayın
3. URL: `ws://localhost:3000/socket` (veya sunucu adresi)
4. Connect butonuna tıklayın
5. JSON mesajı gönderin veya dinleyin

### JavaScript ile Test (Tarayıcı)

```javascript
const socket = new WebSocket('ws://localhost:3000/socket');

socket.onopen = function() {
  console.log('Bağlantı kuruldu');
};

socket.onmessage = function(event) {
  console.log('Alınan veri:', JSON.parse(event.data));
};

socket.onclose = function() {
  console.log('Bağlantı kapandı');
};
```

## Sorun Giderme

### Veritabanı Bağlantı Sorunları

PostgreSQL veritabanına bağlantı sorunlarını kontrol edin:

```bash
docker-compose exec postgres psql -U postgres -d patrion_case -c "SELECT 1"
```

### MQTT Bağlantı Sorunları

MQTT broker'ın çalıştığını kontrol edin:

```bash
docker-compose exec mosquitto mosquitto_sub -t "#" -v
```

### Log Dosyaları

Log dosyalarını inceleyerek sorunları teşhis edin:

```bash
# Node.js uygulama logları
docker-compose logs -f app

# PostgreSQL logları
docker-compose logs -f postgres

# MQTT broker logları
docker-compose logs -f mosquitto

# InfluxDB logları
docker-compose logs -f influxdb
```

### Container İçine Erişim

Sorun gidermek için container içine erişin:

```bash
docker-compose exec app sh
``` 