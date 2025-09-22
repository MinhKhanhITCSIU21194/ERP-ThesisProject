"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = require("../models/entities/user");
const role_1 = require("../models/entities/role");
const session_1 = require("../models/entities/session");
const notification_1 = require("../models/entities/notification");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "erp_system",
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: [user_1.User, role_1.Role, session_1.Session, notification_1.Notification],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("✅ Database connection initialized successfully");
        if (process.env.NODE_ENV === "development") {
            console.log("🔄 Running in development mode - synchronizing database schema");
        }
        return exports.AppDataSource;
    }
    catch (error) {
        console.error("❌ Error during database initialization:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
exports.default = exports.AppDataSource;
//# sourceMappingURL=typeorm.js.map