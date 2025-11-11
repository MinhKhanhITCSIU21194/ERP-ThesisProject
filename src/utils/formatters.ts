import { Permission } from "../models/entities/permission";
import { Role } from "../models/entities/role";

/**
 * Formats a Permission entity to match the Permission type in role.types.ts
 */
export function formatPermission(permission: Permission) {
  return {
    id: permission.id?.toString(),
    permission: permission.permission,
    name: permission.name,
    canView: permission.canView,
    canCreate: permission.canCreate,
    canRead: permission.canRead,
    canUpdate: permission.canUpdate,
    canDelete: permission.canDelete,
    canSetPermission: permission.canSetPermission,
    canImport: permission.canImport,
    canExport: permission.canExport,
    canSubmit: permission.canSubmit,
    canCancel: permission.canCancel,
    canApprove: permission.canApprove,
    canViewSalary: permission.canViewSalary,
    canEditSalary: permission.canEditSalary,
    canReject: permission.canReject,
    canReport: permission.canReport,
    canAssign: permission.canAssign,
    canViewPartial: permission.canViewPartial,
    canViewBenefit: permission.canViewBenefit,
    canViewBelongTo: permission.canViewBelongTo,
    canViewOwner: permission.canViewOwner,
    canPermanentlyDelete: permission.canPermanentlyDelete,
    createdBy: permission.createdBy,
    updatedBy: permission.updatedBy,
    deletedBy: permission.deletedBy,
    createdAt: permission.createdAt?.toISOString(),
    updatedAt: permission.updatedAt?.toISOString(),
    deletedAt: permission.deletedAt?.toISOString(),
  };
}

/**
 * Formats a Role entity to match the Role type in role.types.ts
 */
export function formatRole(role: Role) {
  return {
    id: role.roleId.toString(),
    name: role.name,
    description: role.description || "",
    createdBy: role.createdBy || "",
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt?.toISOString(),
    isActive: role.isActive,
    permissions: role.permissions?.map(formatPermission) || [],
  };
}

/**
 * Formats user data with properly formatted role and permissions
 */
export function formatUserData(user: any) {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role ? formatRole(user.role) : null,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    unreadNotifications: user.unreadNotifications || 0,
  };
}
