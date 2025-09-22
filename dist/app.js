"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5000");
console.log("Environment loaded:", {
    pool: database_1.default,
});
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: "http://localhost:3000", credentials: true }));
app.use(express_1.default.json());
app.get("/", async (req, res) => {
    try {
        const result = await database_1.default.query("SELECT NOW()");
        res.json({
            message: "Hello, World! ERP Backend is running",
            database_time: result.rows[0].now,
            status: "Database connected successfully",
        });
    }
    catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Test the API: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=app.js.map