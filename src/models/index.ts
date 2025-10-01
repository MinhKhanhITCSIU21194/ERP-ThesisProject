// Core Authentication Models
export { User } from "./entities/user";
export { Role } from "./entities/role";
export { Session } from "./entities/session";
export { Notification, NotificationType } from "./entities/notification";

// Re-export all entities for TypeORM
import { User } from "./entities/user";
import { Role } from "./entities/role";
import { Session } from "./entities/session";
import { Notification } from "./entities/notification";
import {
  EmailVerification,
  VerificationType,
} from "./entities/email-verification-code";

export const entities = [
  User,
  Role,
  Session,
  Notification,
  EmailVerification,
  VerificationType,
];
