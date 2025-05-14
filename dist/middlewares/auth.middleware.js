"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSocket = exports.checkCompanyAccess = exports.requirePermission = exports.authorize = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const permission_1 = require("../types/permission");
const user_1 = require("../types/user");
const user_model_1 = require("../models/user.model");
/**
 * Kullanıcının kimliğini doğrulayan middleware
 */
const authenticate = (req, res, next) => {
    try {
        // Token'ı Authorization header'dan al
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                status: 'error',
                message: 'Yetkilendirme token\'ı bulunamadı'
            });
            return;
        }
        // Token'ı çıkar (Bearer kısmını kaldır)
        const token = authHeader.split(' ')[1];
        // Token'ı doğrula
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        // Kullanıcı bilgisini istek nesnesine ekle
        req.user = decoded;
        // Sonraki middleware'e geç
        next();
    }
    catch (error) {
        res.status(401).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Kimlik doğrulama hatası'
        });
    }
};
exports.authenticate = authenticate;
/**
 * Kullanıcının rolünü kontrol eden middleware
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Kimlik doğrulaması gerekli'
            });
            return;
        }
        if (allowedRoles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(403).json({
                status: 'error',
                message: 'Bu işlem için yetkiniz bulunmamaktadır'
            });
        }
    };
};
exports.authorize = authorize;
/**
 * Kullanıcının belirli bir izne sahip olup olmadığını kontrol eden middleware
 */
const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                status: 'error',
                message: 'Kimlik doğrulaması gerekli'
            });
            return;
        }
        const userRole = req.user.role;
        if ((0, permission_1.hasPermission)(userRole, requiredPermission)) {
            next();
        }
        else {
            res.status(403).json({
                status: 'error',
                message: 'Bu işlemi gerçekleştirmek için gerekli izne sahip değilsiniz'
            });
        }
    };
};
exports.requirePermission = requirePermission;
/**
 * Şirket kaynakları için erişim kontrolü yapan middleware
 * Kullanıcının kendi şirketinin kaynaklarına erişimi kısıtlanır
 */
const checkCompanyAccess = (companyIdParamName = 'company_id') => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    message: 'Kimlik doğrulaması gerekli'
                });
                return;
            }
            const userRole = req.user.role;
            const userId = req.user.id;
            // Sistem yöneticisi her şirkete erişebilir
            if (userRole === user_1.UserRole.SYSTEM_ADMIN) {
                next();
                return;
            }
            // Kullanıcının güncel bilgilerini veritabanından al
            const user = yield (0, user_model_1.findUserById)(userId);
            if (!user) {
                res.status(404).json({
                    status: 'error',
                    message: 'Kullanıcı bulunamadı'
                });
                return;
            }
            // Request'ten hedef şirket ID'sini al
            // URL parametre veya request body'den olabilir
            const targetCompanyId = req.params[companyIdParamName] ?
                parseInt(req.params[companyIdParamName], 10) :
                req.body[companyIdParamName];
            if ((0, permission_1.hasCompanyPermission)(userRole, user.company_id, targetCompanyId)) {
                next();
            }
            else {
                res.status(403).json({
                    status: 'error',
                    message: 'Bu şirketin kaynaklarına erişim yetkiniz bulunmamaktadır'
                });
            }
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Yetkilendirme hatası'
            });
        }
    });
};
exports.checkCompanyAccess = checkCompanyAccess;
/**
 * Socket.io bağlantıları için kimlik doğrulama middleware
 */
const authenticateSocket = (socket, next) => {
    var _a;
    try {
        const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
        if (!token) {
            return next(new Error('Yetkilendirme token\'ı bulunamadı'));
        }
        // Token'ı doğrula
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        // Kullanıcı bilgisini socket nesnesine ekle
        socket.data.user = decoded;
        next();
    }
    catch (error) {
        return next(new Error(error instanceof Error ? error.message : 'Kimlik doğrulama hatası'));
    }
};
exports.authenticateSocket = authenticateSocket;
