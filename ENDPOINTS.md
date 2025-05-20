# Patrion Backend API Endpoint Rehberi

Aşağıda tüm backend endpointleri, açıklamaları ve dönüş tipleriyle birlikte sade bir liste olarak verilmiştir.

---

## Kullanıcı (user.controller.ts)

- **GET /users**
  - Tüm kullanıcıları listeler
  - Dönüş: `{ status: string, results: number, data: { users: User[] } }`

- **GET /users/profile**
  - Oturum açmış kullanıcının profilini getirir
  - Dönüş: `{ status: string, data: { user: User } }`

- **GET /users/{id}**
  - ID'ye göre kullanıcı getirir
  - Dönüş: `{ status: string, data: { user: User } }`

- **PUT /users/{id}**
  - Kullanıcı bilgilerini günceller
  - Dönüş: `{ status: string, data: { user: User } }`

- **GET /users/username/{username}**
  - Kullanıcı adına göre kullanıcı getirir
  - Dönüş: `{ status: string, data: { user: User } }`

---

## Şirket (company.controller.ts)

- **GET /companies**
  - Tüm şirketleri listeler
  - Dönüş: `{ status: string, data: { companies: Company[] } }`

- **GET /companies/{id}**
  - ID'ye göre şirket getirir
  - Dönüş: `{ status: string, data: { company: Company } }`

- **POST /companies**
  - Yeni şirket oluşturur
  - Dönüş: `{ status: string, message: string, data: { company: Company } }`

- **PUT /companies/{id}**
  - Şirket bilgilerini günceller
  - Dönüş: `{ status: string, message: string, data: { company: Company } }`

---

## Log (log.controller.ts)

- **GET /logs/users/{userId}**
  - Belirli bir kullanıcının log kayıtlarını getirir
  - Dönüş: `{ status: string, results: number, data: { logs: Log[] } }`

- **GET /logs/my-logs**
  - Kendi log kayıtlarını getirir
  - Dönüş: `{ status: string, results: number, data: { logs: Log[] } }`

- **GET /logs/actions/{action}**
  - Belirli bir eylem tipine ait log kayıtlarını getirir
  - Dönüş: `{ status: string, results: number, data: { logs: Log[] } }`

- **GET /logs/analytics**
  - Log analitiklerini getirir
  - Dönüş: `{ status: string, data: { analytics: any } }`

- **GET /logs/users/{userId}/activity**
  - Kullanıcının aktivite istatistiklerini getirir
  - Dönüş: `{ status: string, data: { activity: any } }`

- **GET /logs/my-activity**
  - Kendi aktivite istatistiklerini getirir
  - Dönüş: `{ status: string, data: { activity: any } }`

---

## Sensör (sensor.controller.ts)

- **GET /sensors/{sensorId}/timeseries**
  - Sensör zaman serisi verisi getirir
  - Dönüş: `{ status: string, data: { sensor_id: string, start_time: number, end_time: number, readings: any[] } }`

- **GET /sensors/{sensorId}/analytics**
  - Sensör analitik verisi getirir
  - Dönüş: `{ status: string, data: { analytics: any } }`

- **POST /sensors/{sensorId}/publish**
  - Sensör verisi manuel yayınla
  - Dönüş: `{ status: string, message: string }`

- **POST /notifications/send**
  - Bildirim gönder
  - Dönüş: `{ status: string, message: string }`

---

## Sistem Logları (system-log.controller.ts)

- **GET /system-logs**
  - Sistem log dosyalarını getirir
  - Dönüş: `{ status: string, total: number, page: number, totalPages: number, data: { logs: string[] } }`

- **GET /system-logs/available**
  - Mevcut sistem log dosyalarını listeler
  - Dönüş: `{ status: string, data: { logFiles: { fileName: string, size: string, lastModified: string }[] } }`

---

## Kimlik Doğrulama (auth.controller.ts)

- **POST /auth/register**
  - Yeni kullanıcı kaydı oluşturur
  - Dönüş: `{ status: string, message: string, data: { user: User } }`

- **POST /auth/login**
  - Kullanıcı girişi yapar
  - Dönüş: `{ status: string, message: string, data: { user: User, token: string } }`
