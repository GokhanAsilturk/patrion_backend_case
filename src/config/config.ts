import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'patrion_case',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'patrion_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  
  mqtt: {
    broker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'sensor_tracking_server',
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || ''
  },
  
  influxdb: {
    url: process.env.INFLUX_URL || 'http://localhost:8086',
    token: process.env.INFLUX_TOKEN || 'mCjO945P8QqKpYoLTcMpqovvVRjIzMWNH52u6PgRR9yRYrMXs5YGAPgTJ-_NfuLC9wf6ADVLBKIUacw7UTxVHw==',
    org: process.env.INFLUX_ORG || 'sensor_org',
    bucket: process.env.INFLUX_BUCKET || 'sensor_data'
  }
};

export default config;