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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               full_name:
 *                 type: string
 *                 example: "John Doe"
 *               company_id:
 *                 type: integer
 *                 example: 1
 *               role:
 *                 type: string
 *                 enum: [user, company_admin, system_admin]
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Kullanıcı başarıyla kaydedildi"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       400:
 *         description: İstek verisi geçersiz
 *       409:
 *         description: Kullanıcı adı veya email zaten kullanımda
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const newUser = yield authService.register(userData);
        res.status(201).json({
            status: 'success',
            message: 'Kullanıcı başarıyla kaydedildi',
            data: { user: newUser }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Kayıt işlemi sırasında bir hata oluştu';
        // 409 (Conflict) durumu için kontrol
        if (errorMessage.includes('zaten kayıtlı')) {
            res.status(409).json({
                status: 'error',
                message: errorMessage
            });
            return;
        }
        res.status(400).json({
            status: 'error',
            message: errorMessage
        });
    }
});
exports.register = register;
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi yapar ve JWT token döndürür
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Giriş başarılı"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         description: İstek verisi geçersiz
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credentials = req.body;
        const user = yield authService.login(credentials);
        res.status(200).json({
            status: 'success',
            message: 'Giriş başarılı',
            data: { user }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Giriş yapılamadı';
        res.status(401).json({
            status: 'error',
            message: errorMessage
        });
    }
});
exports.login = login;
