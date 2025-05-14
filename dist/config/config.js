"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
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
        username: process.env.MQTT_USERNAME || '',
        password: process.env.MQTT_PASSWORD || '',
        clientId: process.env.MQTT_CLIENT_ID || 'patrion_sensor_tracker'
    },
    influxdb: {
        url: process.env.INFLUX_URL || 'http://localhost:8086',
        token: process.env.INFLUX_TOKEN || 'my-token',
        org: process.env.INFLUX_ORG || 'my-org',
        bucket: process.env.INFLUX_BUCKET || 'sensor_data'
    }
};
exports.default = config;
