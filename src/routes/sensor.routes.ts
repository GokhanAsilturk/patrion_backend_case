import { Router } from 'express';
import { getSensorTimeseriesData, getSensorAnalytics } from '../controllers/sensor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { standardRateLimiter } from '../middlewares/rate-limiter.middleware';

const router = Router();

/**
 * @swagger
 * /sensors/{sensorId}/timeseries:
 *   get:
 *     summary: Belirli bir sensörün zaman serisi verilerini getirir
 *     description: Belirli bir zaman aralığında sensör verilerini InfluxDB'den çeker
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Sensör ID"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Başlangıç tarihi (Format - GG/AA/YYYY)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Bitiş tarihi (Format - GG/AA/YYYY)"
 *     responses:
 *       200:
 *         description: Sensör zaman serisi verileri başarıyla getirildi
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Sensör bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:sensorId/timeseries', authenticate, standardRateLimiter, getSensorTimeseriesData);

/**
 * @swagger
 * /sensors/{sensorId}/analytics:
 *   get:
 *     summary: Belirli bir sensörün analitik verilerini getirir
 *     description: Belirli bir zaman aralığında sensör verilerinin istatistiğini çıkarır
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *         description: "Sensör ID"
 *       - in: query
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: "Analiz edilecek alan (örn. temperature, humidity)"
 *       - in: query
 *         name: window
 *         schema:
 *           type: string
 *           default: 1h
 *         description: "Zaman penceresi (örn. 15m, 1h, 1d)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Başlangıç tarihi (Format - GG/AA/YYYY)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Bitiş tarihi (Format - GG/AA/YYYY)"
 *     responses:
 *       200:
 *         description: Sensör analitik verileri başarıyla getirildi
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Sensör bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:sensorId/analytics', authenticate, standardRateLimiter, getSensorAnalytics);

export default router; 