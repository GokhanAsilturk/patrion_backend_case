"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const log_controller_1 = require("../controllers/log.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const permission_1 = require("../types/permission");
const validation_rules_1 = require("../utils/validation.rules");
const router = express_1.default.Router();
// Tüm rotalar için kimlik doğrulama gereklidir
router.use(auth_middleware_1.authenticate);
// Tüm kullanıcı log kayıtlarını getir
router.get('/users/:userId', (0, auth_middleware_1.requirePermission)(permission_1.Permission.VIEW_LOGS), (0, validator_middleware_1.validate)(validation_rules_1.logValidation.getUserLogs), log_controller_1.getUserLogs);
// Oturum açmış kullanıcının kendi log kayıtlarını getir
router.get('/my-logs', (0, validator_middleware_1.validate)(validation_rules_1.logValidation.getUserLogs), log_controller_1.getUserLogs);
// Belirli bir eylem tipi için log kayıtlarını getir
router.get('/actions/:action', (0, auth_middleware_1.requirePermission)(permission_1.Permission.VIEW_LOGS), (0, validator_middleware_1.validate)(validation_rules_1.logValidation.getLogsByAction), log_controller_1.getLogsByAction);
// Log analizlerini getir
router.get('/analytics', (0, auth_middleware_1.requirePermission)(permission_1.Permission.VIEW_LOGS), (0, validator_middleware_1.validate)(validation_rules_1.logValidation.getAnalytics), log_controller_1.getLogsAnalytics);
// Kullanıcı aktivite istatistiklerini getir
router.get('/users/:userId/activity', (0, auth_middleware_1.requirePermission)(permission_1.Permission.VIEW_LOGS), (0, validator_middleware_1.validate)(validation_rules_1.logValidation.getUserActivityStats), log_controller_1.getUserActivityStats);
// Oturum açmış kullanıcının kendi aktivite istatistiklerini getir
router.get('/my-activity', (0, validator_middleware_1.validate)(validation_rules_1.logValidation.getUserActivityStats), log_controller_1.getUserActivityStats);
exports.default = router;
