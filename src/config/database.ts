import { Pool, PoolClient, QueryResult } from 'pg';
import config from './config';
import { log } from '../utils/logger';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  client_encoding: 'UTF8'
});

// Bağlantıda hata olursa tüm uygulamayı çökertmek yerine loglama yap
pool.on('error', (err) => {
  log.error('Beklenmeyen veritabanı hatası', { error: err.message });
});

// Test connection
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    log.info('Veritabanı bağlantısı başarılı', { timestamp: result.rows[0] });
    return true;
  } catch (err) {
    log.error('Veritabanına bağlanırken hata oluştu', { 
      error: err instanceof Error ? err.message : 'Bilinmeyen hata'
    });
    return false;
  } finally {
    if (client) client.release();
  }
};

// Bağlantıyı test et
testConnection();

export default pool; 