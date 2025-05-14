import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur (Sadece System Admin ve Company Admin kullanabilir)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *               company_id:
 *                 type: integer
 *                 example: 1
 *               role:
 *                 type: string
 *                 enum: [user, company_admin, system_admin]
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Kullanıcı başarıyla kaydedildi"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       400:
 *         description: İstek verisi geçersiz
 *       409:
 *         description: Kullanıcı adı veya email zaten kullanımda
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;
    const newUser = await authService.register(userData);
    
    res.status(201).json({
      status: 'success',
      message: 'Kullanıcı başarıyla kaydedildi',
      data: { user: newUser }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Kayıt işlemi sırasında bir hata oluştu';
    
    // 409 (Conflict) durumu için kontrol
    if (errorMessage.includes('zaten kayıtlı')) {
      res.status(409).json({
        status: 'error',
        message: errorMessage
      });
      return;
    }
    
    res.status(400).json({
      status: 'error',
      message: errorMessage
    });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi yapar ve JWT token döndürür
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Giriş başarılı"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         description: İstek verisi geçersiz
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials = req.body;
    const user = await authService.login(credentials);
    
    res.status(200).json({
      status: 'success',
      message: 'Giriş başarılı',
      data: { user }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Giriş yapılamadı';
    res.status(401).json({
      status: 'error',
      message: errorMessage
    });
  }
};