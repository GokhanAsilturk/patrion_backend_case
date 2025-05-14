import { UserRole } from './user';

/**
 * Sistemdeki tüm izinleri tanımlayan enum
 */
export enum Permission {
  // Kullanıcı izinleri
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Şirket izinleri
  VIEW_COMPANIES = 'view_companies',
  CREATE_COMPANY = 'create_company',
  UPDATE_COMPANY = 'update_company',
  DELETE_COMPANY = 'delete_company',
  
  // Sensör izinleri
  VIEW_SENSORS = 'view_sensors',
  CREATE_SENSOR = 'create_sensor',
  UPDATE_SENSOR = 'update_sensor',
  DELETE_SENSOR = 'delete_sensor',
  
  // Sensör verisi izinleri
  VIEW_SENSOR_DATA = 'view_sensor_data',
  EXPORT_SENSOR_DATA = 'export_sensor_data',
  
  // Log izinleri
  VIEW_LOGS = 'view_logs',
  EXPORT_LOGS = 'export_logs',
}

/**
 * Her rol için izinleri tanımlayan nesne
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SYSTEM_ADMIN]: [
    // Sistem yöneticisi tüm izinlere sahiptir
    ...Object.values(Permission)
  ],
  
  [UserRole.COMPANY_ADMIN]: [
    // Şirket yöneticisi şirketiyle ilgili tüm izinlere sahiptir
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    
    Permission.VIEW_COMPANIES,  // Kendi şirketini görebilir
    Permission.UPDATE_COMPANY,  // Kendi şirketini güncelleyebilir
    
    Permission.VIEW_SENSORS,
    Permission.CREATE_SENSOR,
    Permission.UPDATE_SENSOR,
    Permission.DELETE_SENSOR,
    
    Permission.VIEW_SENSOR_DATA,
    Permission.EXPORT_SENSOR_DATA,
    
    Permission.VIEW_LOGS,
    Permission.EXPORT_LOGS,
  ],
  
  [UserRole.USER]: [
    // Normal kullanıcı sınırlı izinlere sahiptir
    Permission.VIEW_SENSORS,    // Şirketinin sensörlerini görebilir
    Permission.VIEW_SENSOR_DATA, // Sensör verilerini görebilir
  ]
};

/**
 * Belirli bir kullanıcı rolünün belirli bir izne sahip olup olmadığını kontrol eder
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

/**
 * Kullanıcı için şirket bazlı izin kontrolü
 * Kullanıcı kendi şirketindeki kaynaklara erişebilir
 */
export const hasCompanyPermission = (
  userRole: UserRole, 
  userCompanyId: number | undefined, 
  targetCompanyId: number | undefined
): boolean => {
  // Sistem yöneticisi tüm şirketlere erişebilir
  if (userRole === UserRole.SYSTEM_ADMIN) {
    return true;
  }
  
  // Şirket yöneticisi ve normal kullanıcı sadece kendi şirketlerine erişebilir
  return (
    userCompanyId !== undefined && 
    targetCompanyId !== undefined && 
    userCompanyId === targetCompanyId
  );
}; 