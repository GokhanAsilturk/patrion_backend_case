"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const package_json_1 = require("../../package.json");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Akıllı Sensör Takip Sistemi API',
            version: package_json_1.version,
            description: 'Fabrikadaki IoT sensörlerinden veri toplayan API dokümantasyonu',
            contact: {
                name: 'API Destek',
                email: 'info@example.com'
            },
        },
        servers: [
            {
                url: '/api',
                description: 'API Sunucusu'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
        './src/models/*.ts',
        './src/types/*.ts'
    ]
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
