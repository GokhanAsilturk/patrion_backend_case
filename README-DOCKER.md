# Docker ile Akıllı Sensör Takip Sistemi Kurulumu

Bu rehber, Akıllı Sensör Takip Sistemi projesinin Docker kullanarak nasıl kurulacağını ve çalıştırılacağını açıklar.

## Gereksinimler

- Docker
- Docker Compose

## Kurulum Adımları

### 1. Projeyi Klonlayın

```bash
git clone <repo_url>
cd patrion_backend_case
```

### 2. Ortam Değişkenlerini Yapılandırın

Projenin kök dizininde `docker-compose.yml` dosyasını açın ve InfluxDB token değerini değiştirin:

```yaml
- INFLUX_TOKEN=your_influxdb_token_here
```

Ayrıca aynı değeri InfluxDB servisinin `DOCKER_INFLUXDB_INIT_ADMIN_TOKEN` değişkenine de yazın:

```yaml
- DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=your_influxdb_token_here
```

### 3. MQTT Dizin Yapısını Oluşturun

```bash
mkdir -p mosquitto/config
mkdir -p mosquitto/data
mkdir -p mosquitto/log
```

### 4. MQTT Yapılandırma Dosyasını Kopyalayın

`mosquitto.conf` dosyasını `mosquitto/config/` dizinine kopyalayın.

### 5. Docker Compose ile Çalıştırın

```bash
docker-compose up -d
```

Bu komut, tüm servisleri (uygulama, PostgreSQL, InfluxDB ve MQTT broker) arka planda başlatacaktır.

### 6. Logları İzleyin

```bash
docker-compose logs -f
```

## Servisler ve Portlar

- **API Uygulaması**: http://localhost:3000
- **Swagger API Dokümantasyonu**: http://localhost:3000/api-docs
- **PostgreSQL**: localhost:5432
- **InfluxDB**: http://localhost:8086
- **MQTT Broker**: localhost:1883 (MQTT) ve localhost:9001 (WebSocket)

## Veritabanı Yönetimi

### InfluxDB Yönetimi

InfluxDB yönetim arayüzüne erişmek için tarayıcınızda http://localhost:8086 adresini açın.

İlk girişte:
- Kullanıcı adı: `admin`
- Şifre: `adminpassword`
- Organizasyon: `sensor_org`
- Bucket: `sensor_data`

### PostgreSQL Yönetimi

PostgreSQL veritabanına erişmek için:

```bash
docker-compose exec postgres psql -U postgres -d patrion_case
```

## Sorun Giderme

### Servis Durumunu Kontrol Etme

```bash
docker-compose ps
```

### Servisi Yeniden Başlatma

```bash
docker-compose restart <servis_adı>
```

Örneğin, uygulamayı yeniden başlatmak için:

```bash
docker-compose restart app
```

### Tüm Servisleri Durdurma

```bash
docker-compose down
```

## Veri Kalıcılığı

Uygulamanın tüm verileri, Docker volume'ları aracılığıyla saklanır:

- PostgreSQL verileri: `postgres_data` volume
- InfluxDB verileri: `influxdb_data` volume
- MQTT broker verileri: `./mosquitto/data` ve `./mosquitto/log` dizinleri 