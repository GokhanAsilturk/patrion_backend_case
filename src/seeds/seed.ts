import * as companyModel from '../models/company.model';
import * as userModel from '../models/user.model';
import { UserInput } from '../types/user';
import { UserRole } from '../types/user';
import bcrypt from 'bcrypt';
import { log } from '../utils/logger';

const seedDatabase = async () => {
  try {
    // Varsayılan şirket verisi
    const company = {
      id: 1,
      name: 'Patrion',
      description: 'test',
      status: 'active' as 'active' | 'inactive'
    };

    // Varsayılan kullanıcı verisi
    const user: UserInput = {
      username: 'systemadmin',
      email: 'admin@system.com',
      password: 'admin123', 
      fullName: 'System Admin',
      company_id: 1,
      role: UserRole.SYSTEM_ADMIN
    };

    // Veritabanında şirketi kontrol et ve ekle
    try {
      const existingCompany = await companyModel.getCompanyById(company.id);
      if (!existingCompany) {
        await companyModel.createCompany(company);
        log.info('Şirket eklendi', { company: { ...company } });
      } else {
        log.info('Şirket zaten mevcut', { companyId: company.id });
      }
    } catch (companyError) {
      log.error('Şirket seed işlemi sırasında hata', { error: companyError instanceof Error ? companyError.message : 'Bilinmeyen hata' });
    }

    // Veritabanında kullanıcıyı kontrol et ve ekle
    try {
      const existingUser = await userModel.findUserByEmail(user.email);
      if (!existingUser) {
        // Şifreyi hash'le
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        // Hash'lenmiş şifre ile kullanıcı oluştur
        await userModel.createUser({
          ...user,
          password: hashedPassword
        });
        
        log.info('Kullanıcı eklendi', { user: { ...user, password: '[GIZLI]' } });
      } else {
        log.info('Kullanıcı zaten mevcut', { email: user.email });
      }
    } catch (userError) {
      log.error('Kullanıcı seed işlemi sırasında hata', { error: userError instanceof Error ? userError.message : 'Bilinmeyen hata' });
    }

  } catch (error) {
    log.error('Seed işlemi sırasında genel hata', { error: error instanceof Error ? error.message : 'Bilinmeyen hata' });
  }
};

export default seedDatabase;