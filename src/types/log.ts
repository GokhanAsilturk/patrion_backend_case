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
  VIEWED_USER_PROFILE = 'viewed_user_profile',
  VIEWED_COMPANY_DATA = 'viewed_company_data',
  EXPORTED_DATA = 'exported_data',
  IMPORTED_DATA = 'imported_data',
  DOWNLOADED_REPORT = 'downloaded_report',
  ADDED_SENSOR = 'added_sensor',
  UPDATED_SENSOR = 'updated_sensor',
  DELETED_SENSOR = 'deleted_sensor',
  SENSOR_STATUS_CHANGE = 'sensor_status_change',
  CREATED_USER = 'created_user',
  UPDATED_USER = 'updated_user',
  DELETED_USER = 'deleted_user',
  UPDATED_PROFILE = 'updated_profile',
  CHANGED_PASSWORD = 'changed_password',
  CREATED_COMPANY = 'created_company',
  UPDATED_COMPANY = 'updated_company',
  DELETED_COMPANY = 'deleted_company',
  LOGIN = 'login',
  LOGOUT = 'logout',
  FAILED_LOGIN = 'failed_login',
  RESET_PASSWORD = 'reset_password',
  API_REQUEST = 'api_request',
  API_ERROR = 'api_error'
}

export interface LogAnalytics {
  action: string;
  count: number;
  first_activity: Date;
  last_activity: Date;
  unique_users: number;
}

export interface UserActivityStats {
  action: string;
  count: number;
  first_activity: Date;
  last_activity: Date;
  ip_addresses: string[];
} 