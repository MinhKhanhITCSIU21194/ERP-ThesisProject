"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const typeorm_1 = require("../config/typeorm");
const user_1 = require("../models/entities/user");
const role_1 = require("../models/entities/role");
class UserService {
    constructor() {
        this.userRepository = typeorm_1.AppDataSource.getRepository(user_1.User);
        this.roleRepository = typeorm_1.AppDataSource.getRepository(role_1.Role);
    }
    async getAllUsers(search, pageIndex = 0, pageSize = 10) {
        try {
            const queryBuilder = this.userRepository
                .createQueryBuilder("user")
                .leftJoinAndSelect("user.role", "role")
                .leftJoinAndSelect("role.permissions", "permissions")
                .where("user.isActive = :isActive", { isActive: true })
                .orderBy("user.createdAt", "DESC");
            if (search && search.trim()) {
                queryBuilder.andWhere("(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)", { search: `%${search.trim()}%` });
            }
            const totalCount = await queryBuilder.getCount();
            queryBuilder.skip(pageIndex * pageSize).take(pageSize);
            const users = await queryBuilder.getMany();
            return { users, totalCount };
        }
        catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    }
    async getUserById(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { userId },
                relations: ["role", "role.permissions"],
            });
            return user;
        }
        catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }
    async getUsersByRole(roleId) {
        try {
            const users = await this.userRepository.find({
                where: { roleId },
                relations: ["role", "role.permissions"],
                order: {
                    createdAt: "DESC",
                },
            });
            return users;
        }
        catch (error) {
            console.error("Error fetching users by role:", error);
            throw error;
        }
    }
    async updateUserStatus(userId, isActive) {
        try {
            const user = await this.userRepository.findOne({
                where: { userId },
            });
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }
            user.isActive = isActive;
            await this.userRepository.save(user);
            return {
                success: true,
                message: `User ${isActive ? "activated" : "deactivated"} successfully`,
                user,
            };
        }
        catch (error) {
            console.error("Error updating user status:", error);
            throw error;
        }
    }
    async updateUserRole(userId, roleId) {
        try {
            const user = await this.userRepository.findOne({
                where: { userId },
            });
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }
            const role = await this.roleRepository.findOne({
                where: { roleId },
            });
            if (!role) {
                return {
                    success: false,
                    message: "Role not found",
                };
            }
            user.roleId = roleId;
            await this.userRepository.save(user);
            const updatedUser = await this.getUserById(userId);
            return {
                success: true,
                message: "User role updated successfully",
                user: updatedUser || undefined,
            };
        }
        catch (error) {
            console.error("Error updating user role:", error);
            throw error;
        }
    }
    async getUserStats() {
        try {
            const total = await this.userRepository.count();
            const active = await this.userRepository.count({
                where: { isActive: true },
            });
            const inactive = await this.userRepository.count({
                where: { isActive: false },
            });
            const roles = await this.roleRepository.find();
            const byRole = await Promise.all(roles.map(async (role) => ({
                roleId: role.roleId,
                roleName: role.name,
                count: await this.userRepository.count({
                    where: { roleId: role.roleId },
                }),
            })));
            return {
                total,
                active,
                inactive,
                byRole,
            };
        }
        catch (error) {
            console.error("Error fetching user stats:", error);
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map