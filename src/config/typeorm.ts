import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../models/entities/user";
import { Role } from "../models/entities/role";
import { Permission } from "../models/entities/permission";
import { Session } from "../models/entities/session";
import { Notification } from "../models/entities/notification";
import { EmailVerification } from "../models/entities/email-verification-code";
import { Employee } from "../models/entities/employee";
import { Department } from "../models/entities/department";
import { Position } from "../models/entities/position";
import { EmployeeDepartment } from "../models/entities/employee-department";
import { Contract } from "../models/entities/contract";
import { LeaveRequest } from "../models/entities/leave-request";
import { Project } from "../models/entities/project";
import { Sprint } from "../models/entities/sprint";
import { Task } from "../models/entities/task";
import { SprintMember } from "../models/entities/sprint-member";
import { TaskAttachment } from "../models/entities/task-attachment";
import { TaskComment } from "../models/entities/task-comment";
import { ProjectMember } from "../models/entities/project-member";
import { RolePermission } from "../models";

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
  entities: [
    User,
    Role,
    Permission,
    SprintMember,
    ProjectMember,
    RolePermission,
    TaskAttachment,
    TaskComment,
    Session,
    Sprint,
    Task,
    Notification,
    EmailVerification,
    Project,
    Employee,
    Department,
    Position,
    EmployeeDepartment,
    Contract,
    LeaveRequest,
  ],
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
