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
const permission_1 = require("../models/entities/permission");
const session_1 = require("../models/entities/session");
const notification_1 = require("../models/entities/notification");
const email_verification_code_1 = require("../models/entities/email-verification-code");
const employee_1 = require("../models/entities/employee");
const department_1 = require("../models/entities/department");
const position_1 = require("../models/entities/position");
const employee_department_1 = require("../models/entities/employee-department");
const contract_1 = require("../models/entities/contract");
const leave_request_1 = require("../models/entities/leave-request");
const project_1 = require("../models/entities/project");
const sprint_1 = require("../models/entities/sprint");
const task_1 = require("../models/entities/task");
const sprint_member_1 = require("../models/entities/sprint-member");
const task_attachment_1 = require("../models/entities/task-attachment");
const task_comment_1 = require("../models/entities/task-comment");
const project_member_1 = require("../models/entities/project-member");
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
    entities: [
        user_1.User,
        role_1.Role,
        permission_1.Permission,
        sprint_member_1.SprintMember,
        project_member_1.ProjectMember,
        task_attachment_1.TaskAttachment,
        task_comment_1.TaskComment,
        session_1.Session,
        sprint_1.Sprint,
        task_1.Task,
        notification_1.Notification,
        email_verification_code_1.EmailVerification,
        project_1.Project,
        employee_1.Employee,
        department_1.Department,
        position_1.Position,
        employee_department_1.EmployeeDepartment,
        contract_1.Contract,
        leave_request_1.LeaveRequest,
    ],
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