import { QueryResult } from 'pg';
import pool from '../config/database';
import { User, UserInput, UserRole } from '../types/user';

export const createUsersTable = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      company_id INTEGER,
      role VARCHAR(20) NOT NULL DEFAULT '${UserRole.USER}',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Users tablosu başarıyla oluşturuldu veya zaten vardı');
  } catch (error) {
    console.error('Users tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const createUser = async (userData: UserInput): Promise<User> => {
  const { username, email, password, fullName = null, company_id = null, role = UserRole.USER } = userData;
  const query = `
    INSERT INTO users (username, email, password, full_name, company_id, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt";
  `;

  try {
    const result: QueryResult = await pool.query(query, [username, email, password, fullName, company_id, role]);
    return result.rows[0] as User;
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = `
    SELECT id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    WHERE email = $1;
  `;

  try {
    const result: QueryResult = await pool.query(query, [email]);
    return result.rows[0] as User || null;
  } catch (error) {
    console.error('Email ile kullanıcı aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const findUserById = async (id: number): Promise<User | null> => {
  const query = `
    SELECT id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    WHERE id = $1;
  `;

  try {
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows[0] as User || null;
  } catch (error) {
    console.error('ID ile kullanıcı aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const findUsersByCompanyId = async (company_id: number): Promise<User[]> => {
  const query = `
    SELECT id, username, email, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    WHERE company_id = $1;
  `;

  try {
    const result: QueryResult = await pool.query(query, [company_id]);
    return result.rows as User[];
  } catch (error) {
    console.error('Şirket ID ile kullanıcı aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const query = `
    SELECT id, username, email, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    ORDER BY id;
  `;

  try {
    const result: QueryResult = await pool.query(query);
    return result.rows as User[];
  } catch (error) {
    console.error('Tüm kullanıcılar alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const updateUser = async (id: number, userData: Partial<UserInput>): Promise<User> => {
  // Güncellenecek alanları ve değerlerini oluştur
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Güncellenebilir alanları kontrol et
  if (userData.email !== undefined) {
    updates.push(`email = $${paramCount}`);
    values.push(userData.email);
    paramCount++;
  }

  if (userData.fullName !== undefined) {
    updates.push(`full_name = $${paramCount}`);
    values.push(userData.fullName);
    paramCount++;
  }

  if (userData.company_id !== undefined) {
    updates.push(`company_id = $${paramCount}`);
    values.push(userData.company_id);
    paramCount++;
  }

  if (userData.role !== undefined) {
    updates.push(`role = $${paramCount}`);
    values.push(userData.role);
    paramCount++;
  }

  // Şifre güncellemesi için ayrı kontrol (şifre hash'lenmişse)
  if (userData.password !== undefined) {
    updates.push(`password = $${paramCount}`);
    values.push(userData.password);
    paramCount++;
  }

  // Güncelleme zamanını ayarla
  updates.push(`updated_at = NOW()`);

  // Güncellenecek alan yoksa hata fırlat
  if (updates.length === 1) { // Sadece updated_at varsa
    throw new Error('Güncellenecek alan bulunamadı');
  }

  // Sorgu oluştur
  const query = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt";
  `;

  values.push(id); // WHERE id = ? için

  try {
    const result: QueryResult = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    return result.rows[0] as User;
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const query = `
    SELECT id, username, email, password, full_name as "fullName", company_id, role, created_at as "createdAt", updated_at as "updatedAt"
    FROM users
    WHERE username = $1;
  `;

  try {
    const result: QueryResult = await pool.query(query, [username]);
    return result.rows[0] as User || null;
  } catch (error) {
    console.error('Kullanıcı adı ile kullanıcı aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
}; 