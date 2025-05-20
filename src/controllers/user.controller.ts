import { Response } from 'express';
import * as userModel from '../models/user.model';
import { AuthRequest } from '../types/auth';
import { createUserLog } from '../models/log.model';
import { LogAction } from '../types/log';

/**
 * Oturum açmış kullanıcının profilini getirir
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Kimlik doğrulaması gerekli'
      });
      return;
    }

    const user = await userModel.findUserById(userId);

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    // Kullanıcının profil görüntüleme log kaydını oluştur
    await createUserLog({
      user_id: userId,
      action: LogAction.VIEWED_USER_PROFILE,
      details: { viewed_self: true },
      ip_address: req.ip
    });

    // Hassas bilgileri çıkart
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Profil bilgileri alınırken bir hata oluştu'
    });
  }
};

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Oturum açmış kullanıcının profilini getirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili başarıyla getirildi
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
 *                     user:
 *                       type: object
 *       401:
 *         description: Kimlik doğrulama gerekli
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Tüm kullanıcıları listeler
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcılar başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *       403:
 *         description: Bu işleme yetkiniz yok, sadece sistem admin kullanabilir
 *       500:
 *         description: Sunucu hatası
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await userModel.getAllUsers();
    
    // Admin'in kullanıcı listesi görüntüleme log kaydını oluştur
    if (req.user) {
      await createUserLog({
        user_id: req.user.id,
        action: LogAction.VIEWED_USER_PROFILE,
        details: { viewed_all_users: true },
        ip_address: req.ip
      });
    }

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Kullanıcılar listelenirken bir hata oluştu'
    });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: ID'ye göre kullanıcı getirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla getirildi
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
 *                     user:
 *                       type: object
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 *   put:
 *     summary: Kullanıcı bilgilerini günceller
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               companyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla güncellendi
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
 *                     user:
 *                       type: object
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * Kullanıcı bilgilerini günceller
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    // Kendi şirketimin kullanıcısını güncelleyip güncelleyemeyeceğimi kontrol et
    if (req.user?.role === 'company_admin') {
      const requestedUser = await userModel.findUserById(userId);
      
      if (!requestedUser || requestedUser.company_id !== req.user.company_id) {
        res.status(403).json({
          status: 'error',
          message: 'Bu kullanıcıyı güncelleme yetkiniz yok'
        });
        return;
      }
      
      // Şirket adminleri rol değiştiremez
      if (req.body.role && req.body.role !== requestedUser.role) {
        res.status(403).json({
          status: 'error',
          message: 'Kullanıcı rolünü değiştirme yetkiniz yok'
        });
        return;
      }
    }

    const userExists = await userModel.findUserById(userId);

    if (!userExists) {
      res.status(404).json({
        status: 'error',
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    // Kullanıcı güncelleme işlemini gerçekleştir
    const updatedUser = await userModel.updateUser(userId, req.body);
    
    // Kullanıcı güncelleme log kaydını oluştur
    if (req.user) {
      await createUserLog({
        user_id: req.user.id,
        action: LogAction.UPDATED_USER,
        details: { updated_user_id: userId, fields_updated: Object.keys(req.body) },
        ip_address: req.ip
      });
    }

    // Hassas bilgileri çıkart
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      status: 'success',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Kullanıcı güncellenirken bir hata oluştu'
    });
  }
};

/**
 * @swagger
 * /users/username/{username}:
 *   get:
 *     summary: Kullanıcı adına göre kullanıcı bilgilerini getirir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcı adı
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla getirildi
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
 *                     user:
 *                       type: object
 *       403:
 *         description: Bu kullanıcıyı görüntüleme yetkiniz yok
 *       404:
 *         description: Kullanıcı bulunamadı
 */
export const getUserByUsername = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const username = req.params.username;
    
    // Erişim kontrolü
    if (req.user?.role !== 'system_admin' && req.user?.role !== 'company_admin') {
      res.status(403).json({
        status: 'error',
        message: 'Bu bilgilere erişim yetkiniz yok'
      });
      return;
    }
    
    // Şirket admin rolündeki kullanıcılar sadece kendi şirketindeki kullanıcıları görüntüleyebilir
    if (req.user?.role === 'company_admin') {
      const requestedUser = await userModel.findUserByUsername(username);
      
      if (!requestedUser || requestedUser.company_id !== req.user.company_id) {
        res.status(403).json({
          status: 'error',
          message: 'Bu kullanıcıyı görüntüleme yetkiniz yok'
        });
        return;
      }
    }
    
    const user = await userModel.findUserByUsername(username);
    
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }
    
    // Kullanıcının profil görüntüleme log kaydını oluştur
    if (req.user) {
      await createUserLog({
        user_id: req.user.id,
        action: LogAction.VIEWED_USER_PROFILE,
        details: { viewed_username: username },
        ip_address: req.ip
      });
    }
    
    // Hassas bilgileri çıkart
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      status: 'success',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Kullanıcı bilgileri alınırken bir hata oluştu'
    });
  }
};