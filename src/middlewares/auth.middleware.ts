import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { Socket } from 'socket.io';
import { Permission, hasPermission, hasCompanyPermission } from '../types/permission';
import { UserRole } from '../types/user';
import { findUserById } from '../models/user.model';
import { AuthRequest } from '../types/auth';

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
export const authorize = (allowedRoles: UserRole[]) => {
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
 * Kullanıcının belirli bir izne sahip olup olmadığını kontrol eden middleware
 */
export const requirePermission = (requiredPermission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Kimlik doğrulaması gerekli'
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    
    if (hasPermission(userRole, requiredPermission)) {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'Bu işlemi gerçekleştirmek için gerekli izne sahip değilsiniz'
      });
    }
  };
};

/**
 * Şirket kaynakları için erişim kontrolü yapan middleware
 * Kullanıcının kendi şirketinin kaynaklarına erişimi kısıtlanır
 */
export const checkCompanyAccess = (companyIdParamName: string = 'company_id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Kimlik doğrulaması gerekli'
        });
        return;
      }
      
      const userRole = req.user.role as UserRole;
      const userId = req.user.id;
      
      // Sistem yöneticisi her şirkete erişebilir
      if (userRole === UserRole.SYSTEM_ADMIN) {
        next();
        return;
      }
      
      // Kullanıcının güncel bilgilerini veritabanından al
      const user = await findUserById(userId);
      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'Kullanıcı bulunamadı'
        });
        return;
      }
      
      // Request'ten hedef şirket ID'sini al
      // URL parametre veya request body'den olabilir
      const targetCompanyId = req.params[companyIdParamName] ? 
        parseInt(req.params[companyIdParamName], 10) : 
        req.body[companyIdParamName];
      
      if (hasCompanyPermission(userRole, user.company_id, targetCompanyId)) {
        next();
      } else {
        res.status(403).json({
          status: 'error',
          message: 'Bu şirketin kaynaklarına erişim yetkiniz bulunmamaktadır'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Yetkilendirme hatası'
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