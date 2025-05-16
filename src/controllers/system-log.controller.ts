import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createUserLog } from '../models/log.model';
import { LogAction } from '../types/log';
import { AuthRequest } from '../types/auth';
import { UserRole } from '../types/user';

/**
 * @swagger
 * /system-logs:
 *   get:
 *     summary: Sistem log dosyalarını getirir
 *     description: Sadece System Admin rolüne sahip kullanıcılar tarafından görüntülenebilir
 *     tags: [System Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, error, exceptions]
 *         description: Log türü (all=combined.log, error=error.log, exceptions=exceptions.log)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Bir sayfada gösterilecek log sayısı
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Aranacak metin
 *     responses:
 *       200:
 *         description: Sistem logları başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 total:
 *                   type: integer
 *                   example: 120
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
export const getSystemLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Kullanıcının System Admin rolüne sahip olduğunu doğrula
    if (req.user?.role !== UserRole.SYSTEM_ADMIN) {
      res.status(403).json({
        status: 'error',
        message: 'Bu işleme yetkiniz bulunmamaktadır. Sadece System Admin rolüne sahip kullanıcılar sistem loglarını görüntüleyebilir.'
      });
      return;
    }

    // Query parametrelerini al
    const type = (req.query.type as string) || 'all';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const search = req.query.search as string;

    // Log dosyasını belirle
    let logFileName: string;
    switch (type) {
      case 'error':
        logFileName = 'error.log';
        break;
      case 'exceptions':
        logFileName = 'exceptions.log';
        break;
      default:
        logFileName = 'combined.log';
    }

    // Log dosyası yolunu oluştur
    const logFilePath = path.join(process.cwd(), 'logs', logFileName);

    // Dosyanın varlığını kontrol et
    if (!fs.existsSync(logFilePath)) {
      res.status(404).json({
        status: 'error',
        message: `Log dosyası bulunamadı: ${logFileName}`
      });
      return;
    }

    // Dosyayı oku
    const fileContent = fs.readFileSync(logFilePath, 'utf-8');
    
    // Satırlara ayır
    let logLines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    // Eğer arama parametresi varsa, filtreleme yap
    if (search) {
      logLines = logLines.filter(line => line.toLowerCase().includes(search.toLowerCase()));
    }
    
    // Toplam log sayısı
    const totalLogs = logLines.length;
    
    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalLogs);
    const paginatedLogs = logLines.slice(startIndex, endIndex);
    
    // Log görüntüleme işlemini kaydet
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_LOGS,
      details: { 
        log_type: type, 
        page, 
        limit, 
        search: search || null 
      },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      total: totalLogs,
      page,
      totalPages: Math.ceil(totalLogs / limit),
      data: {
        logs: paginatedLogs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Sistem logları alınırken hata oluştu'
    });
  }
};

/**
 * @swagger
 * /system-logs/available:
 *   get:
 *     summary: Mevcut sistem log dosyalarını listeler
 *     description: Sadece System Admin rolüne sahip kullanıcılar tarafından görüntülenebilir
 *     tags: [System Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mevcut log dosyaları başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     logFiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fileName:
 *                             type: string
 *                           size:
 *                             type: string
 *                           lastModified:
 *                             type: string
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
export const getAvailableLogFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Kullanıcının System Admin rolüne sahip olduğunu doğrula
    if (req.user?.role !== UserRole.SYSTEM_ADMIN) {
      res.status(403).json({
        status: 'error',
        message: 'Bu işleme yetkiniz bulunmamaktadır. Sadece System Admin rolüne sahip kullanıcılar sistem loglarını görüntüleyebilir.'
      });
      return;
    }

    // Logs klasörü yolunu oluştur
    const logsDir = path.join(process.cwd(), 'logs');

    // Klasörün varlığını kontrol et
    if (!fs.existsSync(logsDir)) {
      res.status(404).json({
        status: 'error',
        message: 'Logs klasörü bulunamadı'
      });
      return;
    }

    // Klasördeki dosyaları oku
    const files = fs.readdirSync(logsDir);
    
    // Dosya bilgilerini oluştur
    const logFiles = files.map(fileName => {
      const filePath = path.join(logsDir, fileName);
      const stats = fs.statSync(filePath);
      
      return {
        fileName,
        size: formatFileSize(stats.size),
        lastModified: stats.mtime.toISOString()
      };
    });
    
    // Log görüntüleme işlemini kaydet
    await createUserLog({
      user_id: req.user?.id || 0,
      action: LogAction.VIEWED_LOGS,
      details: { log_files_listing: true },
      ip_address: req.ip
    });
    
    res.json({
      status: 'success',
      data: {
        logFiles
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Log dosyaları listelenirken hata oluştu'
    });
  }
};

/**
 * Dosya boyutunu formatlar (KB, MB, GB)
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 