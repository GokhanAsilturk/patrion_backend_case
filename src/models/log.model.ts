import { QueryResult } from 'pg';
import pool from '../config/database';
import { UserLog, UserLogInput } from '../types/log';

export const createUserLogsTable = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      action VARCHAR(50) NOT NULL,
      details JSONB,
      ip_address VARCHAR(50),
      user_agent VARCHAR(255),
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('User_logs tablosu başarıyla oluşturuldu veya zaten vardı');
  } catch (error) {
    console.error('User_logs tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const createUserLog = async (logData: UserLogInput): Promise<UserLog> => {
  const { user_id, action, details = null, ip_address = null, timestamp = new Date() } = logData;
  const query = `
    INSERT INTO user_logs (user_id, action, details, ip_address, timestamp)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, action, details, ip_address, timestamp, created_at as "createdAt";
  `;

  try {
    const result: QueryResult = await pool.query(query, [
      user_id, 
      action, 
      details ? JSON.stringify(details) : null, 
      ip_address, 
      timestamp
    ]);
    return result.rows[0] as UserLog;
  } catch (error) {
    console.error('Kullanıcı log kaydı oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getUserLogsByUserId = async (user_id: number): Promise<UserLog[]> => {
  const query = `
    SELECT id, user_id, action, details, ip_address, timestamp, created_at as "createdAt"
    FROM user_logs
    WHERE user_id = $1
    ORDER BY timestamp DESC;
  `;

  try {
    const result: QueryResult = await pool.query(query, [user_id]);
    return result.rows as UserLog[];
  } catch (error) {
    console.error('Kullanıcı ID ile loglar aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getUserLogsByAction = async (action: string): Promise<UserLog[]> => {
  const query = `
    SELECT id, user_id, action, details, ip_address, timestamp, created_at as "createdAt"
    FROM user_logs
    WHERE action = $1
    ORDER BY timestamp DESC;
  `;

  try {
    const result: QueryResult = await pool.query(query, [action]);
    return result.rows as UserLog[];
  } catch (error) {
    console.error('Action ile loglar aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getLogAnalytics = async (days: number = 7): Promise<any> => {
  // Belirli bir süre içindeki log kayıtlarının analizini yapan SQL sorgusu
  const query = `
    SELECT 
      action,
      COUNT(*) as count,
      MIN(timestamp) as first_activity,
      MAX(timestamp) as last_activity,
      COUNT(DISTINCT user_id) as unique_users
    FROM user_logs
    WHERE timestamp > NOW() - INTERVAL '${days} days'
    GROUP BY action
    ORDER BY count DESC;
  `;

  try {
    const result: QueryResult = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Log analitiği alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
}; 