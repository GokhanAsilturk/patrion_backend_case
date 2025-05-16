/**
 * Uygulama için hata kodları
 */
export enum ErrorCode {
  // Genel hatalar (1000-1999)
  UNKNOWN_ERROR = 1000,
  VALIDATION_ERROR = 1001,
  INVALID_REQUEST = 1002,
  NOT_FOUND = 1004,
  OPERATION_FAILED = 1005,
  
  // Yetkilendirme ve kimlik doğrulama hataları (2000-2999)
  UNAUTHORIZED = 2000,
  INVALID_CREDENTIALS = 2001,
  TOKEN_EXPIRED = 2002,
  TOKEN_INVALID = 2003,
  FORBIDDEN = 2004,
  
  // Veritabanı hataları (3000-3999)
  DB_CONNECTION_ERROR = 3000,
  DB_QUERY_ERROR = 3001,
  DUPLICATE_ENTRY = 3002,
  FOREIGN_KEY_VIOLATION = 3003,
  DATA_INTEGRITY_ERROR = 3004,
  
  // Sensör ve IoT cihaz hataları (4000-4999)
  SENSOR_NOT_FOUND = 4000,
  SENSOR_DATA_INVALID = 4001,
  MQTT_CONNECTION_ERROR = 4002,
  MQTT_PUBLISH_ERROR = 4003,
  MQTT_SUBSCRIPTION_ERROR = 4004,
  
  // InfluxDB hataları (5000-5999)
  INFLUXDB_CONNECTION_ERROR = 5000,
  INFLUXDB_QUERY_ERROR = 5001,
  INFLUXDB_WRITE_ERROR = 5002,
  
  // Dış API ve servis hataları (6000-6999)
  EXTERNAL_API_ERROR = 6000,
  SERVICE_UNAVAILABLE = 6001,
  TIMEOUT_ERROR = 6002,
  
  // İş mantığı hataları (7000-7999)
  BUSINESS_RULE_VIOLATION = 7000,
  INVALID_OPERATION = 7001,
  
  // Dosya işlemleri hataları (8000-8999)
  FILE_NOT_FOUND = 8000,
  FILE_TOO_LARGE = 8001,
  INVALID_FILE_TYPE = 8002,
  FILE_READ_ERROR = 8003,
  FILE_WRITE_ERROR = 8004,
  
  // Kullanıcı ve yetki hataları (9000-9999)
  USER_NOT_FOUND = 9000,
  USER_ALREADY_EXISTS = 9001,
  INVALID_ROLE = 9002,
  ROLE_NOT_ALLOWED = 9003
}

/**
 * HTTP durum kodları ile eşleşen ErrorCode değerleri
 */
export const HTTP_STATUS_CODES: Record<ErrorCode, number> = {
  // Genel hatalar
  [ErrorCode.UNKNOWN_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.OPERATION_FAILED]: 500,
  
  // Yetkilendirme ve kimlik doğrulama hataları
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  
  // Veritabanı hataları
  [ErrorCode.DB_CONNECTION_ERROR]: 500,
  [ErrorCode.DB_QUERY_ERROR]: 500,
  [ErrorCode.DUPLICATE_ENTRY]: 409,
  [ErrorCode.FOREIGN_KEY_VIOLATION]: 400,
  [ErrorCode.DATA_INTEGRITY_ERROR]: 500,
  
  // Sensör ve IoT cihaz hataları
  [ErrorCode.SENSOR_NOT_FOUND]: 404,
  [ErrorCode.SENSOR_DATA_INVALID]: 400,
  [ErrorCode.MQTT_CONNECTION_ERROR]: 500,
  [ErrorCode.MQTT_PUBLISH_ERROR]: 500,
  [ErrorCode.MQTT_SUBSCRIPTION_ERROR]: 500,
  
  // InfluxDB hataları
  [ErrorCode.INFLUXDB_CONNECTION_ERROR]: 500,
  [ErrorCode.INFLUXDB_QUERY_ERROR]: 500,
  [ErrorCode.INFLUXDB_WRITE_ERROR]: 500,
  
  // Dış API ve servis hataları
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.TIMEOUT_ERROR]: 504,
  
  // İş mantığı hataları
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 400,
  [ErrorCode.INVALID_OPERATION]: 400,
  
  // Dosya işlemleri hataları
  [ErrorCode.FILE_NOT_FOUND]: 404,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.INVALID_FILE_TYPE]: 400,
  [ErrorCode.FILE_READ_ERROR]: 500,
  [ErrorCode.FILE_WRITE_ERROR]: 500,
  
  // Kullanıcı ve yetki hataları
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.USER_ALREADY_EXISTS]: 409,
  [ErrorCode.INVALID_ROLE]: 400,
  [ErrorCode.ROLE_NOT_ALLOWED]: 403
}; 