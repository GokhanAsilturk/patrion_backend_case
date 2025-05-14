"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const logger_1 = require("../utils/logger");
/**
 * HTTP isteklerini loglayan middleware
 */
const httpLogger = (req, res, next) => {
    // İstek zamanını kaydet
    const startTime = Date.now();
    // Response tamamlandığında log oluştur
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logger_1.log.http(req, res, responseTime);
    });
    next();
};
exports.httpLogger = httpLogger;
