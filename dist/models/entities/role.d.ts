import { Permission } from "./permission";
export declare class Role {
    roleId: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
    users: any[];
    permissions: Permission[];
    hasPermission(resource: string, action: string): boolean;
    canManage(resource: string): boolean;
    getPermissionByResource(resource: string): Permission | undefined;
}
//# sourceMappingURL=role.d.ts.map