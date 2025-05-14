"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const user_1 = require("../types/user");
const validation_rules_1 = require("../utils/validation.rules");
const router = (0, express_1.Router)();
// Kimlik doğrulama gerektiren rotalar
router.get('/profile', auth_middleware_1.authenticate, userController.getProfile);
// Sadece admin kullanıcılarının erişebileceği rotalar
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([user_1.UserRole.SYSTEM_ADMIN]), userController.getAllUsers);
// ID'ye göre kullanıcı getirme
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([user_1.UserRole.SYSTEM_ADMIN, user_1.UserRole.COMPANY_ADMIN]), (0, validator_middleware_1.validate)(validation_rules_1.userValidation.getById), userController.getUserById);
// Kullanıcı bilgilerini güncelleme
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([user_1.UserRole.SYSTEM_ADMIN, user_1.UserRole.COMPANY_ADMIN]), (0, validator_middleware_1.validate)(validation_rules_1.userValidation.update), userController.updateUser);
// Alternatif olarak izin tabanlı yetkilendirme de kullanılabilir
// router.get('/', authenticate, requirePermission(Permission.VIEW_USERS), userController.getAllUsers);
exports.default = router;
