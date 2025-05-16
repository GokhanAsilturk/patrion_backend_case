# MQTT Sensör Test Veri Gönderme Aracı

Bu araç, MQTT protokolü üzerinden test sensör verileri göndermenizi sağlar. Projeyi test etmek, sensör verilerini simüle etmek ve sistemi stres testi yapmak için kullanılabilir.

## Kurulum

1. Gerekli paketleri yükleme:
   ```bash
   npm install mqtt
   ```

2. Eğer MQTT modülü zaten yüklü ise, projedeki `send-test-data.js` dosyasını kullanabilirsiniz.

## Kullanım

Aracı çalıştırmak için:

```bash
node send-test-data.js
```

### Menü Seçenekleri

Araç interaktif bir menü sunar:

1. **Varsayılan test verisi gönder**: Standart sıcaklık ve nem değerleriyle bir sensör verisi gönderir.
2. **Özel sensör ID ile veri gönder**: Kendi belirlediğiniz bir sensör ID'si ile veri gönderebilirsiniz.
3. **Özel sıcaklık ve nem değerleri ile veri gönder**: Kendi belirlediğiniz sensör ID'si, sıcaklık ve nem değerleriyle veri gönderebilirsiniz.
4. **Çoklu veri gönder**: 1000'e kadar rastgele sensör verisi oluşturup gönderebilirsiniz.
5. **JSON dosyasından veri gönder**: Hazırladığınız bir JSON dosyasından veri(ler) okuyup gönderebilirsiniz.
6. **Çıkış**: Programı sonlandırır.

### JSON Dosya Formatı

JSON dosyası tekil bir sensör verisi veya bir dizi sensör verisi içerebilir:

```json
[
  {
    "sensor_id": "temp_sensor_01",
    "timestamp": 1716772800,
    "temperature": 23.5,
    "humidity": 48.2
  },
  {
    "sensor_id": "temp_sensor_01",
    "timestamp": 1716772860,
    "temperature": 23.6,
    "humidity": 48.0
  }
]
```

Örnek bir JSON dosyası `sample-data.json` olarak projede mevcuttur.

## Farklı Ortamlarda Kullanım

### Yerel Geliştirme

Varsayılan olarak araç `mqtt://localhost:1883` adresine bağlanır. Eğer MQTT broker farklı bir adreste çalışıyorsa, `send-test-data.js` dosyasında şu değişikliği yapın:

```javascript
const MQTT_BROKER = 'mqtt://sizin-mqtt-adresiniz:port';
```

### Docker Ortamında

Docker ortamında çalışıyorsanız, Docker ağı içindeki MQTT servis adını kullanmanız gerekir:

```javascript
const MQTT_BROKER = 'mqtt://mqtt:1883';
```

## InfluxDB Sorunlarını Giderme

Eğer veriler MQTT üzerinden başarıyla gönderiliyor ama InfluxDB'de görünmüyorsa:

1. **Token Kontrolü**: InfluxDB token'ının yapılandırma dosyasında ayarlandığından emin olun:
   ```
   # src/config/config.ts veya .env dosyasında
   INFLUX_TOKEN=sizin_token_değeriniz
   ```

2. **Docker Compose Yapılandırması**: Docker kullanıyorsanız, `docker-compose.yml` dosyasındaki aşağıdaki değerlerin her ikisinin de aynı olması gerekir:
   ```yaml
   - INFLUX_TOKEN=sizin_token_değeriniz
   - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=sizin_token_değeriniz
   ```

3. **Log İzleme**: Uygulama loglarında InfluxDB hatalarını kontrol edin:
   ```bash
   docker logs patrion_backend_case-app-1
   ```

4. **InfluxDB Kontrolü**: InfluxDB'nin çalıştığından emin olun:
   ```bash
   docker logs patrion_backend_case-influxdb-1
   ```

5. **Organizasyon ve Bucket Kontrolü**: InfluxDB UI'da (http://localhost:8086) organizasyon ve bucket yapılandırmasını kontrol edin. 