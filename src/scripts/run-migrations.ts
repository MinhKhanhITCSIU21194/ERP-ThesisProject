import { AppDataSource } from "./../config/typeorm";

async function runMigrations() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();
    console.log("✅ Database connection initialized");

    console.log("🚀 Running migrations...");
    await AppDataSource.runMigrations();
    console.log("✅ All migrations completed successfully");

    await AppDataSource.destroy();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
