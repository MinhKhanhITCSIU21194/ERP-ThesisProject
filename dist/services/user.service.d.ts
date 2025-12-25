import { User } from "../models/entities/user";
export declare class UserService {
    private userRepository;
    private roleRepository;
    getAllUsers(search?: string, pageIndex?: number, pageSize?: number): Promise<{
        users: User[];
        totalCount: number;
    }>;
    getUserById(userId: string): Promise<User | null>;
    getUsersByRole(roleId: number): Promise<User[]>;
    updateUserStatus(userId: string, isActive: boolean): Promise<{
        success: boolean;
        message: string;
        user?: User;
    }>;
    updateUserRole(userId: string, roleId: number): Promise<{
        success: boolean;
        message: string;
        user?: User;
    }>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byRole: {
            roleId: number;
            roleName: string;
            count: number;
        }[];
    }>;
}
//# sourceMappingURL=user.service.d.ts.map