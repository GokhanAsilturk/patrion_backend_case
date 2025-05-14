"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = exports.queryClient = exports.writeClient = exports.influxDB = void 0;
const influxdb_client_1 = require("@influxdata/influxdb-client");
Object.defineProperty(exports, "Point", { enumerable: true, get: function () { return influxdb_client_1.Point; } });
const config_1 = __importDefault(require("./config"));
// InfluxDB istemcisini oluştur
const influxDB = new influxdb_client_1.InfluxDB({
    url: config_1.default.influxdb.url,
    token: config_1.default.influxdb.token
});
exports.influxDB = influxDB;
// Write API istemcisini oluştur
const writeClient = influxDB.getWriteApi(config_1.default.influxdb.org, config_1.default.influxdb.bucket, 'ns');
exports.writeClient = writeClient;
// Query API istemcisini oluştur
const queryClient = influxDB.getQueryApi(config_1.default.influxdb.org);
exports.queryClient = queryClient;
