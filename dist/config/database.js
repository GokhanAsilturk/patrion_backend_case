"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = __importDefault(require("./config"));
const pool = new pg_1.Pool({
    host: config_1.default.db.host,
    port: config_1.default.db.port,
    user: config_1.default.db.user,
    password: config_1.default.db.password,
    database: config_1.default.db.database,
    client_encoding: 'UTF8'
});
// Test connection
pool.connect((err, client, done) => {
    if (err) {
        return console.error('Veritabanına bağlanırken hata oluştu:', err.message);
    }
    if (client) {
        client.query('SELECT NOW()', (err, result) => {
            done();
            if (err) {
                return console.error('Sorgu çalıştırılırken hata oluştu:', err.message);
            }
            console.log('Veritabanı bağlantısı başarılı:', result.rows[0]);
        });
    }
});
exports.default = pool;
