"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
/**
 * JWT token oluşturur
 */
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    // @ts-ignore - Tip hatalarını bastırıyoruz
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, {
        expiresIn: config_1.default.jwt.expiresIn,
    });
};
exports.generateToken = generateToken;
/**
 * JWT token'ını doğrular
 */
const verifyToken = (token) => {
    try {
        // @ts-ignore - Tip hatalarını bastırıyoruz
        return jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
    }
    catch (error) {
        throw new Error('Geçersiz veya süresi dolmuş token');
    }
};
exports.verifyToken = verifyToken;
