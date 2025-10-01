import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../models/entities/user";
import { Role } from "../models/entities/role";
import { Session } from "../models/entities/session";
import { Notification } from "../models/entities/notification";
import { EmailVerification } from "../models/entities/email-verification-code";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "erp_system",
  synchronize: process.env.NODE_ENV === "development", // Only in development
  logging: process.env.NODE_ENV === "development",
  entities: [User, Role, Session, Notification, EmailVerification],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});

// Initialize the data source
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection initialized successfully");

    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔄 Running in development mode - synchronizing database schema"
      );
    }

    return AppDataSource;
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    throw error;
  }
};

export default AppDataSource;
