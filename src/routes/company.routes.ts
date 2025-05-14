import { Router } from 'express';
import * as companyController from '../controllers/company.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Tüm şirketleri listele - Yetki gerektiren endpoint
router.get('/', authenticate, companyController.getAllCompanies);

// ID'ye göre şirket bilgilerini getir - Yetki gerektiren endpoint
router.get('/:id', authenticate, companyController.getCompanyById);

// Yeni şirket oluştur - Yetki gerektiren endpoint (System Admin kontrolü controller'da yapılıyor)
router.post('/', authenticate, companyController.createCompany);

// Şirket bilgilerini güncelle - Yetki gerektiren endpoint (System Admin kontrolü controller'da yapılıyor)
router.put('/:id', authenticate, companyController.updateCompany);

export default router; 