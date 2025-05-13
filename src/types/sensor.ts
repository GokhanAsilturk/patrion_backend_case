export interface Sensor {
  id: number;
  sensor_id: string;
  name: string;
  description?: string;
  company_id: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorData {
  id: number;
  sensor_id: string;
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  raw_data: Record<string, any>;
  createdAt: Date;
}

export interface SensorInput {
  sensor_id: string;
  name: string;
  description?: string;
  company_id: number;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface SensorDataInput {
  sensor_id: string;
  timestamp: Date | number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  raw_data: Record<string, any>;
}

export interface MQTTSensorData {
  sensor_id: string;
  timestamp: number;
  temperature?: number;
  humidity?: number;
  [key: string]: any;
} 