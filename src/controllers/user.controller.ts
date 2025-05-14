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
 * Tüm kullanıcıları listeler (sadece admin için)
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