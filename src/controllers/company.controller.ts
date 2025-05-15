import { Request, Response } from 'express';
import * as companyModel from '../models/company.model';
import { log } from '../utils/logger';
import { AuthRequest } from '../types/auth';

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Tüm şirketleri listeler
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Şirketler başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     companies:
 *                       type: array
 */
export const getAllCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companies = await companyModel.getAllCompanies();
    
    res.status(200).json({
      status: 'success',
      data: { companies }
    });
  } catch (error) {
    log.error('Şirketler listelenirken hata', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Şirketler listelenirken bir hata oluştu'
    });
  }
};

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: ID'ye göre şirket bilgilerini getirir
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Şirket ID
 *     responses:
 *       200:
 *         description: Şirket başarıyla getirildi
 *       404:
 *         description: Şirket bulunamadı
 */
export const getCompanyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        status: 'error',
        message: 'Geçersiz ID formatı'
      });
      return;
    }
    
    const company = await companyModel.getCompanyById(id);
    
    if (!company) {
      res.status(404).json({
        status: 'error',
        message: 'Şirket bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: { company }
    });
  } catch (error) {
    log.error('Şirket getirilirken hata', { 
      error: error instanceof Error ? error.message : String(error),
      companyId: req.params.id 
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Şirket getirilirken bir hata oluştu'
    });
  }
};

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Yeni bir şirket oluşturur (Sadece System Admin yetkisi ile)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "XYZ Fabrikası"
 *               description:
 *                 type: string
 *                 example: "XYZ Fabrikası örnek açıklama"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Şirket başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek verisi
 */
export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companyData = req.body;
    
    // Kullanıcının system_admin olup olmadığını kontrol et
    if (req.user?.role !== 'system_admin') {
      res.status(403).json({
        status: 'error',
        message: 'Bu işlem için yetkiniz bulunmamaktadır. Sadece System Admin şirket oluşturabilir.'
      });
      return;
    }
    
    const newCompany = await companyModel.createCompany(companyData);
    
    res.status(201).json({
      status: 'success',
      message: 'Şirket başarıyla oluşturuldu',
      data: { company: newCompany }
    });
  } catch (error) {
    log.error('Şirket oluşturulurken hata', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    res.status(400).json({
      status: 'error',
      message: 'Şirket oluşturulurken bir hata oluştu'
    });
  }
};

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Şirket bilgilerini günceller (Sadece System Admin yetkisi ile)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Şirket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Güncellenmiş Şirket Adı"
 *               description:
 *                 type: string
 *                 example: "Güncellenmiş açıklama"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Şirket başarıyla güncellendi
 *       404:
 *         description: Şirket bulunamadı
 */
export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    // Kullanıcının system_admin olup olmadığını kontrol et
    if (req.user?.role !== 'system_admin') {
      res.status(403).json({
        status: 'error',
        message: 'Bu işlem için yetkiniz bulunmamaktadır. Sadece System Admin şirketleri güncelleyebilir.'
      });
      return;
    }
    
    if (isNaN(id)) {
      res.status(400).json({
        status: 'error',
        message: 'Geçersiz ID formatı'
      });
      return;
    }
    
    const updatedCompany = await companyModel.updateCompany(id, updateData);
    
    if (!updatedCompany) {
      res.status(404).json({
        status: 'error',
        message: 'Şirket bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Şirket başarıyla güncellendi',
      data: { company: updatedCompany }
    });
  } catch (error) {
    log.error('Şirket güncellenirken hata', { 
      error: error instanceof Error ? error.message : String(error),
      companyId: req.params.id 
    });
    
    res.status(400).json({
      status: 'error',
      message: 'Şirket güncellenirken bir hata oluştu'
    });
  }
}; 