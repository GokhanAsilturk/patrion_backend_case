import { Point } from '@influxdata/influxdb-client';
import config from '../config/config';
import { MQTTSensorData } from '../types/sensor';

// InfluxDB bağlantısı için koşullu kontrol
let writeClient: any;
let queryClient: any;

try {
  const { writeClient: wc, queryClient: qc } = require('../config/influxdb');
  writeClient = wc;
  queryClient = qc;
  console.log('InfluxDB bağlantısı başarıyla kuruldu');
} catch (error) {
  console.warn('InfluxDB bağlantısı kurulamadı, sadece PostgreSQL kullanılacak:', 
    error instanceof Error ? error.message : 'Bilinmeyen hata');
}

/**
 * InfluxDB'nin bağlı olup olmadığını kontrol eder
 */
const isInfluxDBConnected = (): boolean => {
  return !!writeClient && !!queryClient;
};

/**
 * Sensör verisini InfluxDB'ye yazar
 */
export const writeSensorData = async (data: MQTTSensorData): Promise<void> => {
  // InfluxDB bağlantısı yoksa işlemi atla
  if (!isInfluxDBConnected()) {
    console.log('InfluxDB bağlantısı yok, veri kaydedilmiyor');
    return;
  }

  try {
    // Sensör verisi için yeni bir Point oluştur
    const point = new Point('sensor_reading')
      .tag('sensor_id', data.sensor_id)
      .timestamp(new Date(data.timestamp * 1000));
    
    // Dinamik olarak tüm değerleri ekle
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'sensor_id' && key !== 'timestamp') {
        if (typeof value === 'number') {
          point.floatField(key, value);
        } else if (typeof value === 'string') {
          point.stringField(key, value);
        } else if (typeof value === 'boolean') {
          point.booleanField(key, value);
        } else if (value !== null && typeof value === 'object') {
          point.stringField(key, JSON.stringify(value));
        }
      }
    });
    
    // Veriyi InfluxDB'ye yaz
    writeClient.writePoint(point);
    await writeClient.flush();
    
    console.log(`Sensör verisi InfluxDB'ye kaydedildi: ${data.sensor_id}`);
    return;
  } catch (error) {
    console.error('InfluxDB\'ye veri yazılırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    // Hatayı fırlatma, sadece logla
    console.warn('InfluxDB hatası uygulama akışını durdurmadı, devam ediliyor');
  }
};

/**
 * Son 24 saat içindeki sensör verilerini getirir
 */
export const getSensorDataLast24Hours = async (sensorId: string): Promise<any[]> => {
  // InfluxDB bağlantısı yoksa boş dizi döndür
  if (!isInfluxDBConnected()) {
    console.log('InfluxDB bağlantısı yok, veri alınamıyor');
    return [];
  }

  try {
    const query = `
      from(bucket: "${config.influxdb.bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r._measurement == "sensor_reading")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
    `;
    
    const results: any[] = [];
    
    for await (const { values, tableMeta } of queryClient.iterateRows(query)) {
      results.push(tableMeta.toObject(values));
    }
    
    return results;
  } catch (error) {
    console.error('InfluxDB\'den veri alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    return []; // Hata durumunda boş dizi döndür
  }
};

/**
 * Belirli bir zaman aralığındaki sensör verilerini getirir
 */
export const getSensorDataInRange = async (sensorId: string, startTime: Date, endTime: Date): Promise<any[]> => {
  // InfluxDB bağlantısı yoksa boş dizi döndür
  if (!isInfluxDBConnected()) {
    console.log('InfluxDB bağlantısı yok, veri alınamıyor');
    return [];
  }

  try {
    const query = `
      from(bucket: "${config.influxdb.bucket}")
        |> range(start: ${startTime.toISOString()}, stop: ${endTime.toISOString()})
        |> filter(fn: (r) => r._measurement == "sensor_reading")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
    `;
    
    const results: any[] = [];
    
    for await (const { values, tableMeta } of queryClient.iterateRows(query)) {
      results.push(tableMeta.toObject(values));
    }
    
    return results;
  } catch (error) {
    console.error('InfluxDB\'den veri alınırken hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    return []; // Hata durumunda boş dizi döndür
  }
}; 