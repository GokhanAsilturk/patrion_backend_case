import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { Socket } from 'socket.io';

// Kimlik doğrulama için özel bir Interface tanımlayalım
interface AuthRequest extends Request {
  user?: any;
}

/**
 * Kullanıcının kimliğini doğrulayan middleware
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Token'ı Authorization header'dan al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Yetkilendirme token\'ı bulunamadı'
      });
      return;
    }

    // Token'ı çıkar (Bearer kısmını kaldır)
    const token = authHeader.split(' ')[1];

    // Token'ı doğrula
    const decoded = verifyToken(token);
    
    // Kullanıcı bilgisini istek nesnesine ekle
    req.user = decoded;
    
    // Sonraki middleware'e geç
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Kimlik doğrulama hatası'
    });
  }
};

/**
 * Kullanıcının rolünü kontrol eden middleware
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Kimlik doğrulaması gerekli'
      });
      return;
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'Bu işlem için yetkiniz bulunmamaktadır'
      });
    }
  };
};

/**
 * Socket.io bağlantıları için kimlik doğrulama middleware
 */
export const authenticateSocket = (socket: Socket, next: (err?: Error) => void): void => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Yetkilendirme token\'ı bulunamadı'));
    }
    
    // Token'ı doğrula
    const decoded = verifyToken(token);
    
    // Kullanıcı bilgisini socket nesnesine ekle
    socket.data.user = decoded;
    
    next();
  } catch (error) {
    return next(new Error(error instanceof Error ? error.message : 'Kimlik doğrulama hatası'));
  }
}; 