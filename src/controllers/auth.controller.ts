import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * Kullanıcı kaydı işlemi
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
    res.status(400).json({
      status: 'error',
      message: errorMessage
    });
  }
};

/**
 * Kullanıcı giriş işlemi
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