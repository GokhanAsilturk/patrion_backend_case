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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const config_1 = __importDefault(require("./config/config"));
const routes_1 = __importDefault(require("./routes"));
const mqtt_service_1 = require("./services/mqtt.service");
const socket_1 = require("./socket");
const user_model_1 = require("./models/user.model");
const company_model_1 = require("./models/company.model");
const sensor_model_1 = require("./models/sensor.model");
const log_model_1 = require("./models/log.model");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const logger_1 = require("./utils/logger");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./utils/swagger"));
// Environment variables
dotenv_1.default.config();
// Express uygulaması
const app = (0, express_1.default)();
const PORT = config_1.default.port;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// HTTP request logger
app.use(logger_middleware_1.httpLogger);
// Initialize database tables
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, company_model_1.createCompaniesTable)();
        yield (0, user_model_1.createUsersTable)();
        yield (0, sensor_model_1.createSensorsTable)().catch(err => {
            logger_1.log.error('Sensör tablosu oluşturulurken hata, şirket tablosu önce oluşturulmalıdır', { error: err.message });
        });
        yield (0, sensor_model_1.createSensorDataTable)().catch(err => {
            logger_1.log.error('Sensör veri tablosu oluşturulurken hata, sensör tablosu önce oluşturulmalıdır', { error: err.message });
        });
        yield (0, log_model_1.createUserLogsTable)().catch(err => {
            logger_1.log.error('Kullanıcı log tablosu oluşturulurken hata, kullanıcı tablosu önce oluşturulmalıdır', { error: err.message });
        });
        logger_1.log.info('Veritabanı tabloları başarıyla oluşturuldu');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger_1.log.error('Veritabanı tabloları oluşturulurken hata', { error: errorMessage });
    }
});
// API Routes
app.use('/api', routes_1.default);
// Swagger documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.default);
});
// Ana sayfa
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Sayfa bulunamadı'
    });
});
// Global error handler
app.use((err, req, res, next) => {
    logger_1.log.error('Uygulama hatası', {
        error: err.message || 'Bilinmeyen hata',
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Sunucu hatası';
    res.status(statusCode).json({
        status: 'error',
        message: errorMessage
    });
});
// HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
(0, socket_1.initSocketIO)(server);
// Start server
server.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.log.info(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    // Initialize database tables
    yield initDatabase();
    // Initialize MQTT client
    (0, mqtt_service_1.initMqttClient)();
}));
// Handle process termination
process.on('SIGTERM', () => {
    logger_1.log.info('SIGTERM sinyali alındı. Sunucu kapatılıyor.');
    server.close(() => {
        logger_1.log.info('HTTP sunucusu kapatıldı.');
        process.exit(0);
    });
});
exports.default = server;
