export type Role = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  permissions: Permission[];
};

export type RoleRequest = {
  id?: string;
  name: string;
  description: string;
  createdBy?: string;
  permissions: Permission[];
};

export type RoleResponse = {
  role: Role;
};

export type RolesResponse = {
  roles: Role[];
  pageSize: number;
  pageIndex: number;
  count: number;
};

export type Permission = {
  id?: string;
  permission: string;
  name?: string;
  canView?: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canSetPermission?: boolean;
  canImport?: boolean;
  canExport?: boolean;
  canSubmit?: boolean;
  canCancel?: boolean;
  canApprove?: boolean;
  canViewSalary?: boolean;
  canEditSalary?: boolean;
  canReject?: boolean;
  canReport?: boolean;
  canAssign?: boolean;
  canViewPartial?: boolean;
  canViewBenefit?: boolean;
  canViewBelongTo?: boolean;
  canViewOwner?: boolean;
  canPermanentlyDelete?: boolean;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export const initPermission = {
  permission: "",
  canView: false,
  canRead: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  canSetPermission: false,
  canSubmit: false,
  canApprove: false,
  canAssign: false,
  canViewSalary: false,
  canEditSalary: false,
  canCancel: false,
  canExport: false,
  canImport: false,
  canReject: false,
  canReport: false,
  canViewBenefit: false,
  canViewBelongTo: false,
  canViewOwner: false,
  canViewPartial: false,
  canPermanentlyDelete: false,
};

export enum UserPermission {
  // ADMINISTRATOR
  USER_MANAGEMENT = "USER_MANAGEMENT",
  ROLE_MANAGEMENT = "ROLE_MANAGEMENT",

  // EMPLOYER
  EMPLOYEE_MANAGEMENT = "EMPLOYEE_MANAGEMENT",
  CONTRACT_MANAGEMENT = "CONTRACT_MANAGEMENT",
  POSITION_MANAGEMENT = "POSITION_MANAGEMENT",
  DEPARTMENT_MANAGEMENT = "DEPARTMENT_MANAGEMENT",
  EDUCATION_MANAGEMENT = "EDUCATION_MANAGEMENT",
  DEGREE_MANAGEMENT = "DEGREE_MANAGEMENT",

  SKILL_TYPE_MANAGEMENT = "SKILL_TYPE_MANAGEMENT",
  SKILL_MANAGEMENT = "SKILL_MANAGEMENT",
  LEAVE_MANAGEMENT = "LEAVE_MANAGEMENT",
  LEAVE_TYPE_MANAGEMENT = "LEAVE_TYPE_MANAGEMENT",
  ANNUAL_LEAVE_MANAGEMENT = "ANNUAL_LEAVE_MANAGEMENT",
  HOLIDAY_MANAGEMENT = "HOLIDAY_MANAGEMENT",
  TIME_SHEET_MANAGEMENT = "TIME_SHEET_MANAGEMENT",
  CV_MANAGEMENT = "CV_MANAGEMENT",
  GROUP_NOTIFICATION_MANAGEMENT = "GROUP_NOTIFICATION_MANAGEMENT",
  MARKET_MANAGEMENT = "MARKET_MANAGEMENT",

  // PROJECT
  PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT",
}
