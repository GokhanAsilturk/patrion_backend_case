# Patrion Backend Case

Bu proje, Patrion Backend Case çalışması için geliştirilmiş bir REST API uygulamasıdır.

## Teknolojiler

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT (JSON Web Token)
- REST API

## Başlangıç

Bu talimatlar, projeyi yerel makinenizde geliştirme ve test amacıyla çalıştırmanız için bir kopya almanıza yardımcı olacaktır.

### Önkoşullar

- Node.js (v14 veya üzeri)
- npm (v6 veya üzeri)
- PostgreSQL

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
   ```

4. PostgreSQL veritabanını oluşturun:
   ```
   createdb patrion_case
   ```

5. Uygulamayı geliştirme modunda başlatın:
   ```
   npm run dev
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