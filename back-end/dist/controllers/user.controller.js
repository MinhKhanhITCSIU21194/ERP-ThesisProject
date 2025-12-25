"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const userService = new user_service_1.UserService();
class UserController {
    async getAllUsers(req, res) {
        try {
            const search = req.query.search;
            const pageIndex = parseInt(req.query.pageIndex) || 0;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const { users, totalCount } = await userService.getAllUsers(search, pageIndex, pageSize);
            const formattedUsers = users.map((user) => ({
                userId: user.userId,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                isActive: user.isActive,
                employeeId: user.employeeId,
                role: {
                    roleId: user.role.roleId,
                    name: user.role.name,
                    description: user.role.description,
                },
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }));
            return res.json({
                success: true,
                users: formattedUsers,
                totalCount,
                count: formattedUsers.length,
                pageIndex,
                pageSize,
                message: "Users retrieved successfully",
            });
        }
        catch (error) {
            console.error("Get all users error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            const formattedUser = {
                userId: user.userId,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                isActive: user.isActive,
                employeeId: user.employeeId,
                role: {
                    roleId: user.role.roleId,
                    name: user.role.name,
                    description: user.role.description,
                    permissions: user.role.permissions,
                },
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
            return res.json({
                success: true,
                user: formattedUser,
                message: "User retrieved successfully",
            });
        }
        catch (error) {
            console.error("Get user by ID error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    async getUsersByRole(req, res) {
        try {
            const { roleId } = req.params;
            const roleIdNumber = parseInt(roleId);
            if (isNaN(roleIdNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role ID",
                });
            }
            const users = await userService.getUsersByRole(roleIdNumber);
            const formattedUsers = users.map((user) => ({
                userId: user.userId,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                isActive: user.isActive,
                employeeId: user.employeeId,
                role: {
                    roleId: user.role.roleId,
                    name: user.role.name,
                    description: user.role.description,
                },
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
            }));
            return res.json({
                success: true,
                users: formattedUsers,
                count: formattedUsers.length,
                message: "Users retrieved successfully",
            });
        }
        catch (error) {
            console.error("Get users by role error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "isActive must be a boolean value",
                });
            }
            const result = await userService.updateUserStatus(id, isActive);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.json(result);
        }
        catch (error) {
            console.error("Update user status error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { roleId } = req.body;
            if (!roleId || typeof roleId !== "number") {
                return res.status(400).json({
                    success: false,
                    message: "Valid role ID is required",
                });
            }
            const result = await userService.updateUserRole(id, roleId);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.json(result);
        }
        catch (error) {
            console.error("Update user role error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
    async getUserStats(req, res) {
        try {
            const stats = await userService.getUserStats();
            return res.json({
                success: true,
                stats,
                message: "User statistics retrieved successfully",
            });
        }
        catch (error) {
            console.error("Get user stats error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=user.controller.js.map