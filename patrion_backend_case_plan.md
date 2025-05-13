# Akıllı Sensör Takip Sistemi

## 📌 Genel Bakış

Bu proje, bir fabrikadaki IoT sensörlerinden MQTT protokolü ile verileri toplayan, bu verileri gerçek zamanlı yayınlayan, hata yönetimi ve logging mekanizması sunan bir backend servisini kapsar. Ayrıca, kullanıcıların logları ne sıklıkla gördüklerini takip eden bir sistem de dahil edilmelidir.

---

## 🏗 Teknoloji Stack

- **Backend:** Node.js (NestJS)
- **Veri Tabanı:** PostgreSQL, InfluxDB
- **Gerçek Zamanlı Veri:** MQTT (paho-mqtt) veya WebSockets
- **Kimlik Doğrulama:** JWT veya API Key
- **Logging:** Structured JSON Logging (basit dosya logging veya alternatif log yaklaşımı)
- **MQTT Broker:** Eclipse Mosquitto veya alternatifi
- **Frontend (Opsiyonel):** Jinja2, React veya Vue.js
- **Containerization & Deployment:** Docker

---

## 🏗 Mimari

### Kullanıcı Rolleri

- **System Admin**
  - Genel entegrasyonu yönetir
  - Şirket ve müşteri kaydı oluşturabilir
  - Kullanıcıları ve rollerini yönetebilir
  - IoT entegrasyonlarını yapabilir
  - Tüm loglara erişebilir
  - Diğer kullanıcılar tarafından görünmez

- **Company Admin**
  - Şirketine kullanıcılar ekleyebilir
  - IoT cihazlardan gelen verileri görüntüleyebilir
  - Kullanıcı davranışlarını analiz edebilir
  - Kullanıcılara cihaz erişim yetkisi verebilir

- **User**
  - Yetkili olduğu IoT verilerini görüntüleyebilir

### Sistem Akışı

- IoT sensörleri MQTT ile veri gönderir
- Backend API, MQTT broker’dan verileri işler ve kaydeder
- Gerçek zamanlı veri yayını WebSockets veya MQTT ile yapılır
- Kullanıcı davranışları loglanır (kim, ne zaman log sayfasına baktı?)
- Loglar JSON formatında kaydedilir

---

## 📡 MQTT Veri Akışı

1. Sensörler MQTT broker'a şu formatta veri yollar:
    ```json
    {
      "sensor_id": "temp_sensor_01",
      "timestamp": 1710772800,
      "temperature": 25.4,
      "humidity": 55.2
    }
    ```
2. Backend API, MQTT broker'a subscribe olur
3. Hatalı veri loglanır
4. Geçerli veriler veritabanına kaydedilir
5. WebSocket veya MQTT ile istemcilere yayın yapılır

---

## 🔐 Güvenlik Gereksinimleri

- API'ler JWT veya API Key ile korunmalı
- MQTT broker TLS/SSL ile korunmalı
- Rate limiting uygulanmalı (DDoS koruması)
- Loglar yetkisiz erişime karşı korunmalı

---

## 📊 Kullanıcı Log Takibi

- Kullanıcı her log sayfasını ziyaret ettiğinde kayıt oluşturulmalı
- Örnek kayıt:
    ```json
    {
      "user_id": "user_123",
      "timestamp": 1710772800,
      "action": "viewed_logs"
    }
    ```
- Kullanıcı davranışları analiz edilerek yoğun zaman dilimleri belirlenmeli

---

## 🎯 Bonus Özellikler

- Projeyi Python ile yeniden yazın
- IoT verilerini görselleştirmek için React/Vue ile dashboard geliştirin
- Kullanıcı davranışlarını analiz edip öngörücü raporlar üretin (ML opsiyonel)
- API endpointlerini Jest (Node.js) veya Pytest (Python) ile test edin
- MQTT bağlantısını MQTT.fx veya Mosquitto CLI ile test edin
- GitHub Actions ile CI/CD süreçleri kurun
- WebSocket üzerinden gelen verileri Postman veya WebSocket UI ile test edin
- Backend servisini Docker ile container haline getirin
- Tüm süreçleri uçtan uca bir sunucuya deploy edin

---

## ✅ Beklenen Teslimatlar

1. Public bir Github reposunda kaynak kodun paylaşılması
2. MQTT veri alım ve yayın servisi
3. Gerçek zamanlı veri yayın mekanizması
4. Logging ve hata yönetimi mekanizması
5. Kullanıcı yönetim mekanizması
6. Kullanıcı log takip mekanizması
7. Dokümantasyon: API endpointleri, mimari tasarım ve deployment rehberi
