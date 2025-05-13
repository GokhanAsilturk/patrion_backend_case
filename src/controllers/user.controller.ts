import { Request, Response } from 'express';
import * as userModel from '../models/user.model';

// Kimlik doğrulama için özel bir Interface tanımlayalım
interface AuthRequest extends Request {
  user?: any;
}

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
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.getAllUsers();

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