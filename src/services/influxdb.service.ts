import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import config from '../config/config';
import { MQTTSensorData } from '../types/sensor';
import { log } from '../utils/logger';

let client: InfluxDB;
let writeApi: WriteApi;

export const initInfluxDB = (): void => {
  try {
    const { url, token, org, bucket } = config.influxdb;
    
    if (!token) {
      log.warn('InfluxDB token tanımlanmadı. InfluxDB desteği devre dışı bırakıldı.');
      return;
    }
    
    client = new InfluxDB({ url, token });
    writeApi = client.getWriteApi(org, bucket, 'ns');
    
    log.info('InfluxDB istemcisi başlatıldı', {
      url,
      org,
      bucket
    });
  } catch (error) {
    log.error('InfluxDB istemcisi başlatılırken hata:', { 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
    });
  }
};

export const writeSensorData = async (sensorData: MQTTSensorData): Promise<void> => {
  try {
    if (!writeApi) {
      log.warn('InfluxDB istemcisi başlatılmadı. Veri yazılamadı.');
      console.warn('InfluxDB istemcisi başlatılmadı. writeApi mevcut değil.');
      return;
    }
    
    const point = new Point('sensor_data')
      .tag('sensor_id', sensorData.sensor_id)
      .timestamp(new Date(sensorData.timestamp * 1000));
    
    Object.entries(sensorData).forEach(([key, value]) => {
      if (key !== 'sensor_id' && key !== 'timestamp' && typeof value === 'number') {
        point.floatField(key, value);
      }
    });
    
    console.log('InfluxDB\'ye yazılacak veri:', sensorData);
    
    writeApi.writePoint(point);
    await writeApi.flush();
    
    console.log('Veri başarıyla InfluxDB\'ye yazıldı:', {
      sensor_id: sensorData.sensor_id,
      timestamp: sensorData.timestamp
    });
    
    log.info('Veri başarıyla InfluxDB\'ye yazıldı', {
      sensor_id: sensorData.sensor_id,
      timestamp: sensorData.timestamp
    });
  } catch (error) {
    console.error('InfluxDB\'ye veri yazılırken hata:', error);
    log.error('InfluxDB\'ye veri yazılırken hata:', { 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      stack: error instanceof Error ? error.stack : '',
      sensor_data: JSON.stringify(sensorData)
    });
    throw error;
  }
};

export const querySensorData = async (sensorId: string, start: number, end: number): Promise<any[]> => {
  try {
    if (!client) {
      log.warn('InfluxDB istemcisi başlatılmadı. Veri sorgulanamadı.');
      return [];
    }
    
    const { org } = config.influxdb;
    const queryApi = client.getQueryApi(org);
    
    const query = `
      from(bucket: "${config.influxdb.bucket}")
        |> range(start: ${new Date(start * 1000).toISOString()}, stop: ${new Date(end * 1000).toISOString()})
        |> filter(fn: (r) => r._measurement == "sensor_data")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
    `;
    
    const result: any[] = [];
    const rows = await queryApi.collectRows(query);
    
    rows.forEach((row: any) => {
      result.push({
        time: new Date(row._time).getTime() / 1000,
        field: row._field,
        value: row._value,
        sensor_id: row.sensor_id
      });
    });
    
    return result;
  } catch (error) {
    log.error('InfluxDB\'den veri sorgulanırken hata:', { 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
    });
    throw error;
  }
};

export const queryAggregatedData = async (
  sensorId: string,
  field: string,
  aggregateWindow: string = "1h",
  start: number,
  end: number
): Promise<any[]> => {
  try {
    if (!client) {
      log.warn('InfluxDB istemcisi başlatılmadı. Veri sorgulanamadı.');
      return [];
    }
    
    const { org } = config.influxdb;
    const queryApi = client.getQueryApi(org);
    
    const query = `
      from(bucket: "${config.influxdb.bucket}")
        |> range(start: ${new Date(start * 1000).toISOString()}, stop: ${new Date(end * 1000).toISOString()})
        |> filter(fn: (r) => r._measurement == "sensor_data")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
        |> filter(fn: (r) => r._field == "${field}")
        |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
        |> yield(name: "mean")
    `;
    
    const result: any[] = [];
    const rows = await queryApi.collectRows(query);
    
    rows.forEach((row: any) => {
      result.push({
        time: new Date(row._time).getTime() / 1000,
        mean: row._value,
        sensor_id: row.sensor_id,
        field: row._field
      });
    });
    
    return result;
  } catch (error) {
    log.error('InfluxDB\'den istatistik sorgulanırken hata:', { 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
    });
    throw error;
  }
};