import { QueryResult } from 'pg';
import pool from '../config/database';
import { Company, CompanyInput } from '../types/company';

export const createCompaniesTable = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Companies tablosu başarıyla oluşturuldu veya zaten vardı');
  } catch (error) {
    console.error('Companies tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const createCompany = async (companyData: CompanyInput): Promise<Company> => {
  const { name, description = null, status = 'active' } = companyData;
  const query = `
    INSERT INTO companies (name, description, status)
    VALUES ($1, $2, $3)
    RETURNING id, name, description, status, created_at as "createdAt", updated_at as "updatedAt";
  `;

  try {
    const result: QueryResult = await pool.query(query, [name, description, status]);
    return result.rows[0] as Company;
  } catch (error) {
    console.error('Şirket oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getCompanyById = async (id: number): Promise<Company | null> => {
  const query = `
    SELECT id, name, description, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM companies
    WHERE id = $1;
  `;

  try {
    const result: QueryResult = await pool.query(query, [id]);
    if (!result || !result.rows) {
      console.error('Sorgu sonucu bulunamadı veya geçersiz');
      return null;
    }
    return result.rows[0] as Company || null;
  } catch (error) {
    console.error('ID ile şirket aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getAllCompanies = async (): Promise<Company[]> => {
  const query = `
    SELECT id, name, description, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM companies
    ORDER BY id;
  `;

  try {
    const result: QueryResult = await pool.query(query);
    return result.rows as Company[];
  } catch (error) {
    console.error('Tüm şirketler alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const updateCompany = async (id: number, companyData: Partial<CompanyInput>): Promise<Company | null> => {
  // Güncelleme zamanını ayarla
  const updates = { ...companyData, updated_at: new Date() };
  
  // Dinamik güncelleme sorgusu oluştur
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  
  // Boş güncelleme kontrolü
  if (keys.length === 0) {
    throw new Error('Güncellenecek veri bulunamadı');
  }
  
  // Sorgu için set ifadelerini oluştur
  const setClauses = keys.map((key, index) => {
    // Camel case'i snake case'e çevir (örn: createdAt -> created_at)
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    return `${snakeKey} = $${index + 1}`;
  }).join(', ');
  
  const query = `
    UPDATE companies 
    SET ${setClauses}
    WHERE id = $${keys.length + 1}
    RETURNING id, name, description, status, created_at as "createdAt", updated_at as "updatedAt";
  `;
  
  try {
    const result: QueryResult = await pool.query(query, [...values, id]);
    return result.rows[0] as Company || null;
  } catch (error) {
    console.error('Şirket güncellenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
}; 