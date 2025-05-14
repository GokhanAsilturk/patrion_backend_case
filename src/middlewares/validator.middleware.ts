import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

/**
 * Validasyon hatalarını kontrol eden middleware
 * Eğer validasyon hataları varsa, bu hataları döndürür
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Tüm validasyon kurallarını çalıştır
    await Promise.all(validations.map(validation => validation.run(req)));

    // Hataları topla
    const errors = validationResult(req);
    
    // Hata yoksa devam et
    if (errors.isEmpty()) {
      next();
      return;
    }

    // Hatalar varsa 400 Bad Request ile hataları döndür
    res.status(400).json({
      status: 'error',
      message: 'Validasyon hatası',
      errors: errors.array()
    });
  };
}; 