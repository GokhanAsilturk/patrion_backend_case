import { InfluxDB, Point } from '@influxdata/influxdb-client';
import config from './config';

// InfluxDB istemcisini oluştur
const influxDB = new InfluxDB({
  url: config.influxdb.url,
  token: config.influxdb.token
});

// Write API istemcisini oluştur
const writeClient = influxDB.getWriteApi(
  config.influxdb.org,
  config.influxdb.bucket,
  'ns'
);

// Query API istemcisini oluştur
const queryClient = influxDB.getQueryApi(config.influxdb.org);

export { influxDB, writeClient, queryClient, Point }; 