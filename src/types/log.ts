export interface UserLog {
  id: number;
  user_id: number;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  timestamp: Date;
  createdAt: Date;
}

export interface UserLogInput {
  user_id: number;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  timestamp?: Date;
}

export enum LogAction {
  VIEWED_LOGS = 'viewed_logs',
  VIEWED_SENSOR_DATA = 'viewed_sensor_data',
  EXPORTED_DATA = 'exported_data',
  ADDED_SENSOR = 'added_sensor',
  UPDATED_SENSOR = 'updated_sensor',
  LOGIN = 'login',
  LOGOUT = 'logout'
} 