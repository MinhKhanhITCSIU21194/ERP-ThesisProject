"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("./../config/typeorm");
async function runMigrations() {
    try {
        console.log("🔄 Initializing database connection...");
        await typeorm_1.AppDataSource.initialize();
        console.log("✅ Database connection initialized");
        console.log("🚀 Running migrations...");
        await typeorm_1.AppDataSource.runMigrations();
        console.log("✅ All migrations completed successfully");
        await typeorm_1.AppDataSource.destroy();
        console.log("✅ Database connection closed");
    }
    catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}
runMigrations();
//# sourceMappingURL=run-migrations.js.map