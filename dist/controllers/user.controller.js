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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = exports.getAllUsers = exports.getProfile = void 0;
const userModel = __importStar(require("../models/user.model"));
const log_model_1 = require("../models/log.model");
const log_1 = require("../types/log");
/**
 * Oturum açmış kullanıcının profilini getirir
 */
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                status: 'error',
                message: 'Kimlik doğrulaması gerekli'
            });
            return;
        }
        const user = yield userModel.findUserById(userId);
        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        // Kullanıcının profil görüntüleme log kaydını oluştur
        yield (0, log_model_1.createUserLog)({
            user_id: userId,
            action: log_1.LogAction.VIEWED_USER_PROFILE,
            details: { viewed_self: true },
            ip_address: req.ip
        });
        // Hassas bilgileri çıkart
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(200).json({
            status: 'success',
            data: { user: userWithoutPassword }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Profil bilgileri alınırken bir hata oluştu'
        });
    }
});
exports.getProfile = getProfile;
/**
 * Tüm kullanıcıları listeler (sadece admin için)
 */
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel.getAllUsers();
        // Admin'in kullanıcı listesi görüntüleme log kaydını oluştur
        if (req.user) {
            yield (0, log_model_1.createUserLog)({
                user_id: req.user.id,
                action: log_1.LogAction.VIEWED_USER_PROFILE,
                details: { viewed_all_users: true },
                ip_address: req.ip
            });
        }
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Kullanıcılar listelenirken bir hata oluştu'
        });
    }
});
exports.getAllUsers = getAllUsers;
/**
 * ID'ye göre kullanıcı getirir
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = parseInt(req.params.id, 10);
        // Kendi şirketimin kullanıcısını görüntüleyip görüntüleyemeyeceğimi kontrol et
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'company_admin') {
            const requestedUser = yield userModel.findUserById(userId);
            if (!requestedUser || requestedUser.company_id !== req.user.company_id) {
                res.status(403).json({
                    status: 'error',
                    message: 'Bu kullanıcıyı görüntüleme yetkiniz yok'
                });
                return;
            }
        }
        const user = yield userModel.findUserById(userId);
        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        // Kullanıcının profil görüntüleme log kaydını oluştur
        if (req.user) {
            yield (0, log_model_1.createUserLog)({
                user_id: req.user.id,
                action: log_1.LogAction.VIEWED_USER_PROFILE,
                details: { viewed_user_id: userId },
                ip_address: req.ip
            });
        }
        // Hassas bilgileri çıkart
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(200).json({
            status: 'success',
            data: { user: userWithoutPassword }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Kullanıcı bilgileri alınırken bir hata oluştu'
        });
    }
});
exports.getUserById = getUserById;
/**
 * Kullanıcı bilgilerini günceller
 */
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = parseInt(req.params.id, 10);
        // Kendi şirketimin kullanıcısını güncelleyip güncelleyemeyeceğimi kontrol et
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'company_admin') {
            const requestedUser = yield userModel.findUserById(userId);
            if (!requestedUser || requestedUser.company_id !== req.user.company_id) {
                res.status(403).json({
                    status: 'error',
                    message: 'Bu kullanıcıyı güncelleme yetkiniz yok'
                });
                return;
            }
            // Şirket adminleri rol değiştiremez
            if (req.body.role && req.body.role !== requestedUser.role) {
                res.status(403).json({
                    status: 'error',
                    message: 'Kullanıcı rolünü değiştirme yetkiniz yok'
                });
                return;
            }
        }
        const userExists = yield userModel.findUserById(userId);
        if (!userExists) {
            res.status(404).json({
                status: 'error',
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        // Kullanıcı güncelleme işlemini gerçekleştir
        const updatedUser = yield userModel.updateUser(userId, req.body);
        // Kullanıcı güncelleme log kaydını oluştur
        if (req.user) {
            yield (0, log_model_1.createUserLog)({
                user_id: req.user.id,
                action: log_1.LogAction.UPDATED_USER,
                details: { updated_user_id: userId, fields_updated: Object.keys(req.body) },
                ip_address: req.ip
            });
        }
        // Hassas bilgileri çıkart
        const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
        res.status(200).json({
            status: 'success',
            data: { user: userWithoutPassword }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Kullanıcı güncellenirken bir hata oluştu'
        });
    }
});
exports.updateUser = updateUser;
