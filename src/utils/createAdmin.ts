import * as userModel from '../models/user.model';
import * as companyModel from '../models/company.model';
import bcrypt from 'bcrypt';
import { UserRole } from '../types/user';
import { log } from './logger';
import dotenv from 'dotenv';
import pool from '../config/database';
import { createCompaniesTable } from '../models/company.model';
import { createUsersTable } from '../models/user.model';

dotenv.config();

async function createSystemAdmin() {
  try {
    await createCompaniesTable();
    log.info('Şirket tablosu başarıyla oluşturuldu');
    
    await createUsersTable();
    log.info('Kullanıcı tablosu başarıyla oluşturuldu');
    
    const existingAdmin = await userModel.findUserByEmail('admin@system.com');
    
    if (existingAdmin) {
      log.info('System Admin kullanıcısı zaten mevcut');
      process.exit(0);
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const admin = await userModel.createUser({
      username: 'systemadmin',
      email: 'admin@system.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: UserRole.SYSTEM_ADMIN
    });
    
    log.info('System Admin kullanıcısı başarıyla oluşturuldu', { userId: admin.id });
    console.log('System Admin kullanıcısı oluşturuldu:');
    console.log('Email: admin@system.com');
    console.log('Şifre: admin123');
    
    process.exit(0);
  } catch (error) {
    log.error('System Admin kullanıcısı oluşturulurken hata', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    console.error('Hata:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

createSystemAdmin();