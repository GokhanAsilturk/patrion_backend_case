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
exports.login = exports.register = void 0;
const userModel = __importStar(require("../models/user.model"));
const jwt_utils_1 = require("../utils/jwt.utils");
const bcrypt = require("bcrypt");
/**
 * Kullanıcı kaydı yapar
 */
const register = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Şifreyi hash'le (normalde bcrypt kullanılır)
        const hashedPassword = bcrypt.hashSync(userData.password, 10);
        // Kullanıcıyı veritabanına kaydet
        const user = yield userModel.createUser(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
        // JWT token oluştur
        const token = (0, jwt_utils_1.generateToken)(user);
        // Hassas bilgileri çıkar ve yanıt döndür
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return Object.assign(Object.assign({}, userWithoutPassword), { token });
    }
    catch (error) {
        console.error('Kullanıcı kaydı sırasında hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.register = register;
/**
 * Kullanıcı girişi yapar
 */
const login = (credentials) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Email ile kullanıcıyı bul
        const user = yield userModel.findUserByEmail(credentials.email);
        if (!user) {
            throw new Error('Kullanıcı bulunamadı');
        }
        // Şifre kontrolü yap (geçici olarak direkt karşılaştırma yapıyoruz)
        const isValidPassword = credentials.password === user.password;
        if (!isValidPassword) {
            throw new Error('Geçersiz şifre');
        }
        // JWT token oluştur
        const token = (0, jwt_utils_1.generateToken)(user);
        // Hassas bilgileri çıkar ve token ile yanıt döndür
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return Object.assign(Object.assign({}, userWithoutPassword), { token });
    }
    catch (error) {
        console.error('Giriş sırasında hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
        throw error;
    }
});
exports.login = login;
