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
export declare const initPermission: {
    permission: string;
    canView: boolean;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canSetPermission: boolean;
    canSubmit: boolean;
    canApprove: boolean;
    canAssign: boolean;
    canViewSalary: boolean;
    canEditSalary: boolean;
    canCancel: boolean;
    canExport: boolean;
    canImport: boolean;
    canReject: boolean;
    canReport: boolean;
    canViewBenefit: boolean;
    canViewBelongTo: boolean;
    canViewOwner: boolean;
    canViewPartial: boolean;
    canPermanentlyDelete: boolean;
};
export declare enum UserPermission {
    USER_MANAGEMENT = "USER_MANAGEMENT",
    ROLE_MANAGEMENT = "ROLE_MANAGEMENT",
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
    GROUP_NOTIFICATION_MANAGEMENT = "GROUP_NOTIFICATION_MANAGEMENT",
    MARKET_MANAGEMENT = "MARKET_MANAGEMENT",
    PROJECT_MANAGEMENT = "PROJECT_MANAGEMENT"
}
//# sourceMappingURL=role.types.d.ts.map