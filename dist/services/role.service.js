"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const typeorm_1 = require("../config/typeorm");
const role_1 = require("../models/entities/role");
const permission_1 = require("../models/entities/permission");
class RoleService {
    constructor() {
        this.roleRepository = typeorm_1.AppDataSource.getRepository(role_1.Role);
        this.permissionRepository = typeorm_1.AppDataSource.getRepository(permission_1.Permission);
    }
    async getRoles(pageIndex = 0, pageSize = 10) {
        const [roles, total] = await this.roleRepository.findAndCount({
            relations: ["permissions", "users"],
            skip: pageIndex * pageSize,
            take: pageSize,
            order: { createdAt: "DESC" },
        });
        return {
            roles: roles.map((role) => ({
                ...role,
                userCount: role.users?.length || 0,
            })),
            total,
            pageIndex,
            pageSize,
        };
    }
    async getRoleById(roleId) {
        return await this.roleRepository.findOne({
            where: { roleId },
            relations: ["permissions", "users"],
        });
    }
    async createRole(data) {
        const existingRole = await this.roleRepository.findOne({
            where: { name: data.name },
        });
        if (existingRole) {
            throw new Error(`Role with name "${data.name}" already exists`);
        }
        const permissions = await this.permissionRepository.findByIds(data.permissionIds);
        if (permissions.length !== data.permissionIds.length) {
            throw new Error("Some permissions not found");
        }
        const role = this.roleRepository.create({
            name: data.name,
            description: data.description,
            createdBy: data.createdBy,
            permissions,
        });
        return await this.roleRepository.save(role);
    }
    async updateRole(roleId, data) {
        const role = await this.getRoleById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        if (data.name && data.name !== role.name) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: data.name },
            });
            if (existingRole) {
                throw new Error(`Role with name "${data.name}" already exists`);
            }
        }
        if (data.name)
            role.name = data.name;
        if (data.description !== undefined)
            role.description = data.description;
        if (data.isActive !== undefined)
            role.isActive = data.isActive;
        if (data.permissionIds) {
            const permissions = await this.permissionRepository.findByIds(data.permissionIds);
            if (permissions.length !== data.permissionIds.length) {
                throw new Error("Some permissions not found");
            }
            role.permissions = permissions;
        }
        return await this.roleRepository.save(role);
    }
    async deleteRole(roleId) {
        const role = await this.getRoleById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        if (role.users && role.users.length > 0) {
            throw new Error(`Cannot delete role "${role.name}" because it has ${role.users.length} user(s) assigned to it`);
        }
        await this.roleRepository.remove(role);
    }
    async getAllPermissions() {
        return await this.permissionRepository.find({
            order: { permission: "ASC" },
        });
    }
    async getRoleStats() {
        const totalRoles = await this.roleRepository.count();
        const activeRoles = await this.roleRepository.count({
            where: { isActive: true },
        });
        return {
            totalRoles,
            activeRoles,
            inactiveRoles: totalRoles - activeRoles,
        };
    }
}
exports.RoleService = RoleService;
//# sourceMappingURL=role.service.js.map