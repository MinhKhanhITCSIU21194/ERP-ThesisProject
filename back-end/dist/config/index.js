"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "ERPThesis",
    password: process.env.DB_PASSWORD || "123456",
    port: parseInt(process.env.DB_PORT || "5432"),
});
exports.default = pool;
//# sourceMappingURL=index.js.map