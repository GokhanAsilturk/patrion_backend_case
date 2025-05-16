# Akıllı Sensör Takip Sistemi Deployment Rehberi

Bu rehber, Akıllı Sensör Takip Sistemi'nin nasıl kurulacağını ve çalıştırılacağını adım adım açıklar.

## İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [1. Ortam Değişkenleri](#1-ortam-değişkenleri)
3. [2. Veritabanı Kurulumu](#2-veritabanı-kurulumu)
4. [3. Standart Kurulum](#3-standart-kurulum)
5. [4. Docker ile Kurulum](#4-docker-ile-kurulum)
6. [5. MQTT Broker Kurulumu](#5-mqtt-broker-kurulumu)
7. [6. Sistem Testi](#6-sistem-testi)
8. [Sorun Giderme](#sorun-giderme)
9. [Performans Optimizasyonu](#performans-optimizasyonu)

## Gereksinimler

- Node.js (v14.x veya üzeri)
- PostgreSQL (v13.x veya üzeri)
- MQTT Broker (Eclipse Mosquitto önerilir)
- Docker ve Docker Compose (opsiyonel, containerize deployment için)

## 1. Ortam Değişkenleri

Projenin kök dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```
# Uygulama
PORT=3000
NODE_ENV=production

# PostgreSQL
PGHOST=localhost
PGUSER=postgres
PGDATABASE=sensor_tracking
PGPASSWORD=postgres
PGPORT=5432

# JWT
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRATION=24h

# MQTT
MQTT_BROKER=mqtt://localhost:1883
MQTT_CLIENT_ID=sensor_tracking_server
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=mqtt_password
```

## 2. Veritabanı Kurulumu

1. PostgreSQL'i kurun ve çalıştırın
2. Veritabanını oluşturun:

```bash
psql -U postgres -c "CREATE DATABASE sensor_tracking;"
```

## 3. Standart Kurulum

1. Proje bağımlılıklarını yükleyin:

```bash
npm install
```

2. Veritabanı tablolarını oluşturmak için uygulamayı çalıştırın:

```bash
npm run start
```

3. Seed verilerini eklemek için:

```bash
npm run seed
```

4. Uygulamayı üretim modunda çalıştırın:

```bash
npm run build
npm run start:prod
```

## 4. Docker ile Kurulum

1. Docker Compose ile tüm servisleri başlatın:

```bash
docker-compose up -d
```

2. Sadece uygulamayı Docker ile çalıştırmak için:

```bash
docker build -t sensor-tracking-app .
docker run -p 3000:3000 --env-file .env sensor-tracking-app
```

## 5. MQTT Broker Kurulumu

1. Eclipse Mosquitto'yu indirin ve kurun
2. Temel yapılandırma dosyasını oluşturun (`mosquitto.conf`):

```
listener 1883
allow_anonymous true
```

3. Mosquitto'yu başlatın:

```bash
mosquitto -c mosquitto.conf
```

## 6. Sistem Testi

1. Sistemi test etmek için:

```bash
# API erişimini test et
curl http://localhost:3000/api-docs

# MQTT bağlantısını test et
mosquitto_pub -h localhost -p 1883 -t "sensors/test/data" -m '{"sensor_id":"test","timestamp":1710772800,"temperature":25.4,"humidity":55.2}'
```

## Sorun Giderme

1. **Veritabanı Bağlantı Hatası**: PostgreSQL'in çalıştığından ve .env dosyasındaki bağlantı bilgilerinin doğru olduğundan emin olun.

2. **MQTT Bağlantı Hatası**: Mosquitto broker'ın çalıştığını ve port 1883'ün açık olduğunu kontrol edin.

3. **WebSocket Hataları**: Sunucunun başarıyla başlatıldığından emin olun ve WebSocket bağlantısını test edin.

## Performans Optimizasyonu

- Yüksek yük altında performans için Node.js cluster modunu etkinleştirin
- PostgreSQL ve MQTT için bağlantı havuzlarını optimum değerlere ayarlayın
- Sensör verilerinin arşivlenmesi için düzenli bakım görevleri planlayın 