import { QueryResult } from 'pg';
import pool from '../config/database';
import { MQTTSensorData, SensorData, SensorDataInput } from '../types/sensor';
import { getSensorBySensorId } from '../models/sensor.model';
import { io } from '../socket';

export const saveSensorData = async (data: MQTTSensorData): Promise<SensorData | null> => {
  try {
    const sensor = await getSensorBySensorId(data.sensor_id);
    
    if (!sensor) {
      console.warn(`Bilinmeyen sensör ID: ${data.sensor_id}`);
      return null;
    }
    
    const sensorData: SensorDataInput = {
      sensor_id: data.sensor_id,
      timestamp: new Date(data.timestamp * 1000),
      temperature: data.temperature,
      humidity: data.humidity,
      raw_data: data
    };
    
    const savedData = await insertSensorData(sensorData);
    
    io?.emit(`sensor/${data.sensor_id}/data`, savedData);
    
    return savedData;
  } catch (error) {
    console.error('Sensör verisi kaydedilirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    return null;
  }
};

export const insertSensorData = async (data: SensorDataInput): Promise<SensorData> => {
  const { sensor_id, timestamp, temperature, humidity, pressure, raw_data } = data;
  
  const query = `
    INSERT INTO sensor_data (sensor_id, timestamp, temperature, humidity, pressure, raw_data)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, sensor_id, timestamp, temperature, humidity, pressure, raw_data, created_at as "createdAt";
  `;
  
  try {
    const result: QueryResult = await pool.query(query, [
      sensor_id,
      timestamp,
      temperature || null,
      humidity || null,
      pressure || null,
      JSON.stringify(raw_data)
    ]);
    
    return result.rows[0] as SensorData;
  } catch (error) {
    console.error('Sensör verisi veritabanına kaydedilirken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getLatestSensorData = async (sensor_id: string): Promise<SensorData | null> => {
  const query = `
    SELECT id, sensor_id, timestamp, temperature, humidity, pressure, raw_data, created_at as "createdAt"
    FROM sensor_data
    WHERE sensor_id = $1
    ORDER BY timestamp DESC
    LIMIT 1;
  `;
  
  try {
    const result: QueryResult = await pool.query(query, [sensor_id]);
    return result.rows[0] as SensorData || null;
  } catch (error) {
    console.error('Son sensör verisi alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

export const getSensorDataByTimeRange = async (
  sensor_id: string,
  start: Date,
  end: Date
): Promise<SensorData[]> => {
  const query = `
    SELECT id, sensor_id, timestamp, temperature, humidity, pressure, raw_data, created_at as "createdAt"
    FROM sensor_data
    WHERE sensor_id = $1 AND timestamp BETWEEN $2 AND $3
    ORDER BY timestamp;
  `;
  
  try {
    const result: QueryResult = await pool.query(query, [sensor_id, start, end]);
    return result.rows as SensorData[];
  } catch (error) {
    console.error('Zaman aralığındaki sensör verileri alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};