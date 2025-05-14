# Akıllı Sensör Takip Sistemi Kurulum Rehberi

Bu rehber, Akıllı Sensör Takip Sistemi'ni kurmanız ve kullanmanız için gereken adımları içerir.

## Ön Koşullar

- Node.js (v14 veya üzeri)
- PostgreSQL veritabanı
- MQTT broker (opsiyonel: Mosquitto veya alternatifi)
- npm veya yarn

## Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone [repo-url]
   cd patrion_backend_case
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyasını yapılandırın:
   ```
   PORT=3000
   NODE_ENV=development
   
   # Veritabanı
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=patrion_iot
   
   # JWT
   JWT_SECRET=yourjwtsecretkey
   JWT_EXPIRES_IN=1d
   
   # MQTT
   MQTT_BROKER_URL=mqtt://localhost:1883
   MQTT_USERNAME=
   MQTT_PASSWORD=
   MQTT_TOPIC=sensors/#
   ```

4. Veritabanını oluşturun:
   ```bash
   # PostgreSQL komut satırı ile:
   createdb patrion_iot
   ```

5. Veritabanı tablolarını sıfırlayın (varsa):
   ```bash
   npm run reset-db
   ```

6. Uygulamayı başlatın ve tablolar oluşturulsun:
   ```bash
   npm run dev
   ```

7. System Admin kullanıcısı oluşturun:
   ```bash
   npm run create-admin
   ```
   Bu işlem size aşağıdaki bilgileri olan bir system admin kullanıcısı oluşturacak:
   - Email: admin@system.com
   - Şifre: admin123

## Kullanım

1. System Admin olarak giriş yapın:
   - Tarayıcınızda `http://localhost:3000/api-docs` adresine gidin
   - `/auth/login` endpoint'ini kullanarak giriş yapın:
     ```json
     {
       "email": "admin@system.com",
       "password": "admin123"
     }
     ```
   - Dönen token'ı kopyalayın ve Swagger UI'da "Authorize" düğmesine tıklayarak "Bearer [token]" şeklinde ekleyin.

2. İlk şirketi oluşturun (System Admin olarak):
   - `/companies` endpoint'ini kullanarak yeni bir şirket oluşturun:
     ```json
     {
       "name": "XYZ Fabrikası",
       "description": "XYZ Fabrikası örnek açıklama"
     }
     ```

3. Company Admin ekleyin (System Admin olarak):
   - `/auth/register` endpoint'ini kullanarak yeni bir Company Admin kullanıcısı oluşturun:
     ```json
     {
       "username": "companyadmin",
       "email": "admin@company.com",
       "password": "company123",
       "full_name": "Company Admin",
       "company_id": 1,
       "role": "company_admin"
     }
     ```

4. Company Admin ile giriş yapın:
   - `/auth/login` endpoint'ini kullanarak Company Admin olarak giriş yapın
   - Token'ı alın ve oluşturulan Company Admin ile devam edin

5. Normal kullanıcılar ekleyin (Company Admin olarak):
   - `/auth/register` endpoint'ini kullanarak normal kullanıcılar oluşturun:
     ```json
     {
       "username": "user1",
       "email": "user1@company.com",
       "password": "user123",
       "full_name": "User One",
       "company_id": 1,
       "role": "user"
     }
     ```

## Akış Diyagramı

1. System Admin → Şirket oluşturur → Company Admin ekler
2. Company Admin → Sensör ekler → Kullanıcı ekler → Kullanıcılara sensör erişim izinleri verir
3. Kullanıcı → Yetkili olduğu sensör verilerini görüntüler

## API Belgelendirmesi

API belgelerine erişmek için uygulamayı başlattıktan sonra tarayıcınızda `http://localhost:3000/api-docs` adresine gidin. Burada tüm API endpoint'lerini ve nasıl kullanılacaklarına dair bilgileri bulabilirsiniz.

## Önemli Notlar

- **User (Kullanıcı)** kendisi kayıt olamaz, sadece **System Admin** veya **Company Admin** onları ekleyebilir.
- **Company Admin** sadece kendi şirketindeki kullanıcıları ve sensörleri yönetebilir.
- **System Admin** tüm sistemi yönetebilir. 