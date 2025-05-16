import pool from '../config/database';
import { log } from './logger';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    console.log('Mevcut tabloları kaldırma işlemi başlıyor...');
    
    await pool.query(`
      DROP TABLE IF EXISTS user_logs CASCADE;
      DROP TABLE IF EXISTS sensor_data CASCADE;
      DROP TABLE IF EXISTS sensors CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
    `);
    
    console.log('Tüm tablolar başarıyla kaldırıldı.');
    console.log('Veritabanını sıfırlama işlemi tamamlandı. Şimdi uygulamayı başlatarak tabloları yeniden oluşturabilirsiniz.');
    console.log('System admin oluşturmak için: npm run create-admin');
    
    process.exit(0);
  } catch (error) {
    log.error('Veritabanı sıfırlanırken hata', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    console.error('Hata:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

resetDatabase();