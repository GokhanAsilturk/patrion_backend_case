import { Pool, PoolClient, QueryResult } from 'pg';
import config from './config';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  client_encoding: 'UTF8'
});

// Test connection
pool.connect((err: Error | undefined, client: PoolClient | undefined, done: (release?: any) => void) => {
  if (err) {
    return console.error('Veritabanına bağlanırken hata oluştu:', err.message);
  }
  
  if (client) {
    client.query('SELECT NOW()', (err: Error | null, result: QueryResult) => {
      done();
      if (err) {
        return console.error('Sorgu çalıştırılırken hata oluştu:', err.message);
      }
      console.log('Veritabanı bağlantısı başarılı:', result.rows[0]);
    });
  }
});

export default pool; 