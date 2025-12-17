"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_service_1 = require("../services/role.service");
class RoleController {
    constructor() {
        this.roleService = new role_service_1.RoleService();
    }
    async getRoles(req, res) {
        try {
            const pageIndex = parseInt(req.query.pageIndex) || 0;
            const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 100);
            const result = await this.roleService.getRoles(pageIndex, pageSize);
            res.status(200).json({
                success: true,
                data: result.roles,
                totalCount: result.total,
                pageIndex: result.pageIndex,
                pageSize: result.pageSize,
            });
        }
        catch (error) {
            console.error("Error fetching roles:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch roles",
                error: error.message,
            });
        }
    }
    async getRoleById(req, res) {
        try {
            const roleId = parseInt(req.params.id);
            if (isNaN(roleId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role ID",
                });
            }
            const role = await this.roleService.getRoleById(roleId);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found",
                });
            }
            res.status(200).json({
                success: true,
                data: role,
            });
        }
        catch (error) {
            console.error("Error fetching role:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch role",
                error: error.message,
            });
        }
    }
    async createRole(req, res) {
        try {
            const { name, description, permissionIds } = req.body;
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "Role name is required",
                });
            }
            if (!permissionIds || !Array.isArray(permissionIds)) {
                return res.status(400).json({
                    success: false,
                    message: "Permission IDs are required and must be an array",
                });
            }
            const role = await this.roleService.createRole({
                name,
                description,
                permissionIds,
                createdBy: req.user?.userId,
            });
            res.status(201).json({
                success: true,
                message: "Role created successfully",
                data: role,
            });
        }
        catch (error) {
            console.error("Error creating role:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to create role",
            });
        }
    }
    async updateRole(req, res) {
        try {
            const roleId = parseInt(req.params.id);
            if (isNaN(roleId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role ID",
                });
            }
            const { name, description, permissionIds, isActive } = req.body;
            const role = await this.roleService.updateRole(roleId, {
                name,
                description,
                permissionIds,
                isActive,
            });
            res.status(200).json({
                success: true,
                message: "Role updated successfully",
                data: role,
            });
        }
        catch (error) {
            console.error("Error updating role:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update role",
            });
        }
    }
    async deleteRole(req, res) {
        try {
            const roleId = parseInt(req.params.id);
            if (isNaN(roleId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role ID",
                });
            }
            await this.roleService.deleteRole(roleId);
            res.status(200).json({
                success: true,
                message: "Role deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting role:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to delete role",
            });
        }
    }
    async getPermissions(req, res) {
        try {
            const permissions = await this.roleService.getAllPermissions();
            res.status(200).json({
                success: true,
                data: permissions,
            });
        }
        catch (error) {
            console.error("Error fetching permissions:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch permissions",
                error: error.message,
            });
        }
    }
    async getStats(req, res) {
        try {
            const stats = await this.roleService.getRoleStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching role stats:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch role statistics",
                error: error.message,
            });
        }
    }
}
const roleController = new RoleController();
exports.default = roleController;
//# sourceMappingURL=role.controller.js.map