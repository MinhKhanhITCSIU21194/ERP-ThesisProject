// Core Authentication Models
export { User } from "./entities/user";
export { Role } from "./entities/role";
export { Permission } from "./entities/permission";
export { Session } from "./entities/session";
export { Notification, NotificationType } from "./entities/notification";

// HR Management Models
export {
  Employee,
  EmploymentStatus,
  ContractType,
  MaritalStatus,
  Gender,
} from "./entities/employee";

export { Department, DepartmentType } from "./entities/department";
export { Position, PositionLevel } from "./entities/position";
export { EmployeeDepartment } from "./entities/employee-department";

// Re-export all entities for TypeORM
import { User } from "./entities/user";
import { Role } from "./entities/role";
import { Permission } from "./entities/permission";
import { Session } from "./entities/session";
import { Notification } from "./entities/notification";
import {
  EmailVerification,
  VerificationType,
} from "./entities/email-verification-code";
import { Employee } from "./entities/employee";
import { Department } from "./entities/department";
import { Position } from "./entities/position";
import { EmployeeDepartment } from "./entities/employee-department";

export const entities = [
  User,
  Role,
  Permission,
  Session,
  Notification,
  EmailVerification,
  Employee,
  Department,
  Position,
  EmployeeDepartment,
];
