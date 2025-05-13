import { QueryResult } from 'pg';
import pool from '../config/database';
import { Sensor, SensorInput } from '../types/sensor';

export const createSensorsTable = async (): Promise<void> => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sensors (
      id SERIAL PRIMARY KEY,
      sensor_id VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      company_id INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Sensors tablosu başarıyla oluşturuldu veya zaten vardı');
  } catch (error) {
    console.error('Sensors tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const createSensorDataTable = async (): Promise<void> => {
  // PostgreSQL'de sensör verilerini saklayacak geçici tablo
  // Gerçek uygulama için InfluxDB kullanılacak
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sensor_data (
      id SERIAL PRIMARY KEY,
      sensor_id VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      temperature DECIMAL(10, 2),
      humidity DECIMAL(10, 2),
      pressure DECIMAL(10, 2),
      raw_data JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id) ON DELETE CASCADE
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Sensor_data tablosu başarıyla oluşturuldu veya zaten vardı');
  } catch (error) {
    console.error('Sensor_data tablosu oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const createSensor = async (sensorData: SensorInput): Promise<Sensor> => {
  const { sensor_id, name, description = null, company_id, status = 'active' } = sensorData;
  const query = `
    INSERT INTO sensors (sensor_id, name, description, company_id, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt";
  `;

  try {
    const result: QueryResult = await pool.query(query, [sensor_id, name, description, company_id, status]);
    return result.rows[0] as Sensor;
  } catch (error) {
    console.error('Sensör oluşturulurken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getSensorById = async (id: number): Promise<Sensor | null> => {
  const query = `
    SELECT id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM sensors
    WHERE id = $1;
  `;

  try {
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows[0] as Sensor || null;
  } catch (error) {
    console.error('ID ile sensör aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getSensorBySensorId = async (sensor_id: string): Promise<Sensor | null> => {
  const query = `
    SELECT id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM sensors
    WHERE sensor_id = $1;
  `;

  try {
    const result: QueryResult = await pool.query(query, [sensor_id]);
    return result.rows[0] as Sensor || null;
  } catch (error) {
    console.error('Sensor ID ile sensör aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getSensorsByCompanyId = async (company_id: number): Promise<Sensor[]> => {
  const query = `
    SELECT id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt"
    FROM sensors
    WHERE company_id = $1
    ORDER BY id;
  `;

  try {
    const result: QueryResult = await pool.query(query, [company_id]);
    return result.rows as Sensor[];
  } catch (error) {
    console.error('Şirket ID ile sensörler aranırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const updateSensorStatus = async (id: number, status: 'active' | 'inactive' | 'maintenance'): Promise<Sensor | null> => {
  const query = `
    UPDATE sensors
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, sensor_id, name, description, company_id, status, created_at as "createdAt", updated_at as "updatedAt";
  `;

  try {
    const result: QueryResult = await pool.query(query, [status, id]);
    return result.rows[0] as Sensor || null;
  } catch (error) {
    console.error('Sensör durumu güncellenirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
}; 