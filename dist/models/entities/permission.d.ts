import { Role } from "./role";
export declare class Permission {
    id: number;
    permission: string;
    name?: string;
    canView?: boolean;
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
    canPermanentlyDelete?: boolean;
    canSetPermission?: boolean;
    canImport?: boolean;
    canExport?: boolean;
    canSubmit?: boolean;
    canCancel?: boolean;
    canApprove?: boolean;
    canReject?: boolean;
    canAssign?: boolean;
    canViewSalary?: boolean;
    canEditSalary?: boolean;
    canViewBenefit?: boolean;
    canReport?: boolean;
    canViewPartial?: boolean;
    canViewBelongTo?: boolean;
    canViewOwner?: boolean;
    createdBy?: string;
    updatedBy?: string;
    deletedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    isDeleted: boolean;
    roles: Role[];
    hasAnyPermission(): boolean;
    hasFullAccess(): boolean;
}
//# sourceMappingURL=permission.d.ts.map