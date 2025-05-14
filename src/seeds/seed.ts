import * as companyModel from '../models/company.model';
import * as userModel from '../models/user.model';
import { UserInput } from '../types/user';
import { UserRole } from '../types/user';

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
    const existingCompany = await companyModel.getCompanyById(company.id);
    if (!existingCompany) {
      await companyModel.createCompany(company);
      console.log('Şirket eklendi:', company);
    }

    // Veritabanında kullanıcıyı kontrol et ve ekle
    const existingUser = await userModel.findUserByEmail(user.email);
    if (!existingUser) {
      await userModel.createUser(user);
      console.log('Kullanıcı eklendi:', user);
    }

  } catch (error) {
    console.error('Seed işlemi sırasında hata:', error);
  }
};

export default seedDatabase;