"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCompanyPermission = exports.hasPermission = exports.ROLE_PERMISSIONS = exports.Permission = void 0;
const user_1 = require("./user");
/**
 * Sistemdeki tüm izinleri tanımlayan enum
 */
var Permission;
(function (Permission) {
    // Kullanıcı izinleri
    Permission["VIEW_USERS"] = "view_users";
    Permission["CREATE_USER"] = "create_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    // Şirket izinleri
    Permission["VIEW_COMPANIES"] = "view_companies";
    Permission["CREATE_COMPANY"] = "create_company";
    Permission["UPDATE_COMPANY"] = "update_company";
    Permission["DELETE_COMPANY"] = "delete_company";
    // Sensör izinleri
    Permission["VIEW_SENSORS"] = "view_sensors";
    Permission["CREATE_SENSOR"] = "create_sensor";
    Permission["UPDATE_SENSOR"] = "update_sensor";
    Permission["DELETE_SENSOR"] = "delete_sensor";
    // Sensör verisi izinleri
    Permission["VIEW_SENSOR_DATA"] = "view_sensor_data";
    Permission["EXPORT_SENSOR_DATA"] = "export_sensor_data";
    // Log izinleri
    Permission["VIEW_LOGS"] = "view_logs";
    Permission["EXPORT_LOGS"] = "export_logs";
})(Permission || (exports.Permission = Permission = {}));
/**
 * Her rol için izinleri tanımlayan nesne
 */
exports.ROLE_PERMISSIONS = {
    [user_1.UserRole.SYSTEM_ADMIN]: [
        // Sistem yöneticisi tüm izinlere sahiptir
        ...Object.values(Permission)
    ],
    [user_1.UserRole.COMPANY_ADMIN]: [
        // Şirket yöneticisi şirketiyle ilgili tüm izinlere sahiptir
        Permission.VIEW_USERS,
        Permission.CREATE_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.VIEW_COMPANIES, // Kendi şirketini görebilir
        Permission.UPDATE_COMPANY, // Kendi şirketini güncelleyebilir
        Permission.VIEW_SENSORS,
        Permission.CREATE_SENSOR,
        Permission.UPDATE_SENSOR,
        Permission.DELETE_SENSOR,
        Permission.VIEW_SENSOR_DATA,
        Permission.EXPORT_SENSOR_DATA,
        Permission.VIEW_LOGS,
        Permission.EXPORT_LOGS,
    ],
    [user_1.UserRole.USER]: [
        // Normal kullanıcı sınırlı izinlere sahiptir
        Permission.VIEW_SENSORS, // Şirketinin sensörlerini görebilir
        Permission.VIEW_SENSOR_DATA, // Sensör verilerini görebilir
    ]
};
/**
 * Belirli bir kullanıcı rolünün belirli bir izne sahip olup olmadığını kontrol eder
 */
const hasPermission = (role, permission) => {
    var _a;
    return ((_a = exports.ROLE_PERMISSIONS[role]) === null || _a === void 0 ? void 0 : _a.includes(permission)) || false;
};
exports.hasPermission = hasPermission;
/**
 * Kullanıcı için şirket bazlı izin kontrolü
 * Kullanıcı kendi şirketindeki kaynaklara erişebilir
 */
const hasCompanyPermission = (userRole, userCompanyId, targetCompanyId) => {
    // Sistem yöneticisi tüm şirketlere erişebilir
    if (userRole === user_1.UserRole.SYSTEM_ADMIN) {
        return true;
    }
    // Şirket yöneticisi ve normal kullanıcı sadece kendi şirketlerine erişebilir
    return (userCompanyId !== undefined &&
        targetCompanyId !== undefined &&
        userCompanyId === targetCompanyId);
};
exports.hasCompanyPermission = hasCompanyPermission;
