"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("./config/typeorm");
const session_cleanup_service_1 = require("./services/session-cleanup.service");
const socket_1 = require("./config/socket");
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const allowedOrigins = require("./config/allowedOrigin");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = parseInt(process.env.PORT || "5000");
app.use((0, cookie_parser_1.default)());
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({
        message: "ERP System API is running",
        version: "1.0.0",
        endpoints: {
            users: "/api/users",
            auth: "/api/auth",
            employees: "/api/employees",
        },
        docs: "/api/docs",
    });
});
app.use("/api", routes_1.default);
const startServer = async () => {
    try {
        await (0, typeorm_1.initializeDatabase)();
        (0, socket_1.initializeSocketService)(httpServer);
        session_cleanup_service_1.sessionCleanupService.start();
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`🔗 Test the API: http://localhost:${PORT}`);
            console.log(`🍪 Cookie-based authentication enabled`);
            console.log(`🔄 Session cleanup service started`);
            console.log(`🔌 Socket.IO real-time notifications enabled`);
        });
        process.on("SIGTERM", () => {
            console.log("SIGTERM received, shutting down gracefully");
            session_cleanup_service_1.sessionCleanupService.stop();
            process.exit(0);
        });
        process.on("SIGINT", () => {
            console.log("SIGINT received, shutting down gracefully");
            session_cleanup_service_1.sessionCleanupService.stop();
            process.exit(0);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=app.js.map