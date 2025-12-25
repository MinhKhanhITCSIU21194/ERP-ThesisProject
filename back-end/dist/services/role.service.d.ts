import { Role } from "../models/entities/role";
import { Permission } from "../models/entities/permission";
export declare class RoleService {
    private roleRepository;
    private permissionRepository;
    constructor();
    getRoles(pageIndex?: number, pageSize?: number): Promise<{
        roles: {
            userCount: number;
            roleId: number;
            name: string;
            description?: string;
            isActive: boolean;
            createdBy?: string;
            createdAt: Date;
            updatedAt: Date;
            users: any[];
            permissions: Permission[];
        }[];
        total: number;
        pageIndex: number;
        pageSize: number;
    }>;
    getRoleById(roleId: number): Promise<Role | null>;
    createRole(data: {
        name: string;
        description?: string;
        permissionIds: number[];
        createdBy?: string;
    }): Promise<Role>;
    updateRole(roleId: number, data: {
        name?: string;
        description?: string;
        permissionIds?: number[];
        isActive?: boolean;
    }): Promise<Role>;
    deleteRole(roleId: number): Promise<void>;
    getAllPermissions(): Promise<Permission[]>;
    getRoleStats(): Promise<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
    }>;
}
//# sourceMappingURL=role.service.d.ts.map