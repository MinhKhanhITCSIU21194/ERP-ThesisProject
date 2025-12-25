// Core Authentication Models
export { User } from "./entities/user";
export { Role } from "./entities/role";
export { Permission } from "./entities/permission";
export { RolePermission } from "./entities/role-permission";
export { Session } from "./entities/session";
export { Notification, NotificationType } from "./entities/notification";

// HR Management Models
export {
  Employee,
  EmploymentStatus,
  MaritalStatus,
  Gender,
} from "./entities/employee";

export { Department } from "./entities/department";
export { Position, PositionLevel } from "./entities/position";
export { EmployeeDepartment } from "./entities/employee-department";
export {
  Contract,
  ContractStatus,
  ContractType,
  WorkingType,
} from "./entities/contract";

// Project Management Models
export { Project, ProjectStatus, ProjectPriority } from "./entities/project";
export { ProjectMember, ProjectMemberRole } from "./entities/project-member";
export { Sprint, SprintStatus } from "./entities/sprint";
export { Task, TaskStatus, TaskPriority, TaskType } from "./entities/task";
export { SprintMember, SprintMemberRole } from "./entities/sprint-member";
export { TaskComment } from "./entities/task-comment";
export { TaskAttachment, AttachmentType } from "./entities/task-attachment";

// Leave Management Models
export {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "./entities/leave-request";

// Re-export all entities for TypeORM
import { User } from "./entities/user";
import { Role } from "./entities/role";
import { Permission } from "./entities/permission";
import { RolePermission } from "./entities/role-permission";
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
import { Contract } from "./entities/contract";
import { Project } from "./entities/project";
import { ProjectMember } from "./entities/project-member";
import { Sprint } from "./entities/sprint";
import { Task } from "./entities/task";
import { SprintMember } from "./entities/sprint-member";
import { TaskComment } from "./entities/task-comment";
import { TaskAttachment } from "./entities/task-attachment";
import { LeaveRequest } from "./entities/leave-request";

export const entities = [
  User,
  Role,
  Permission,
  RolePermission,
  Session,
  Notification,
  EmailVerification,
  Employee,
  Department,
  Position,
  EmployeeDepartment,
  Contract,
  Project,
  ProjectMember,
  Sprint,
  SprintMember,
  Task,
  TaskComment,
  TaskAttachment,
  LeaveRequest,
];
