import { AppDataSource } from "../config/typeorm";
import { Role } from "../models/entities/role";
import { Permission } from "../models/entities/permission";
import { Repository } from "typeorm";

export class RoleService {
  private roleRepository: Repository<Role>;
  private permissionRepository: Repository<Permission>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
    this.permissionRepository = AppDataSource.getRepository(Permission);
  }

  /**
   * Get all roles with pagination
   */
  async getRoles(pageIndex: number = 0, pageSize: number = 10) {
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

  /**
   * Get role by ID
   */
  async getRoleById(roleId: number): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { roleId },
      relations: ["permissions", "users"],
    });
  }

  /**
   * Create a new role
   */
  async createRole(data: {
    name: string;
    description?: string;
    permissionIds: number[];
    createdBy?: string;
  }): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: data.name },
    });

    if (existingRole) {
      throw new Error(`Role with name "${data.name}" already exists`);
    }

    // Fetch permissions
    const permissions = await this.permissionRepository.findByIds(
      data.permissionIds
    );

    if (permissions.length !== data.permissionIds.length) {
      throw new Error("Some permissions not found");
    }

    // Create role
    const role = this.roleRepository.create({
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      permissions,
    });

    return await this.roleRepository.save(role);
  }

  /**
   * Update a role
   */
  async updateRole(
    roleId: number,
    data: {
      name?: string;
      description?: string;
      permissionIds?: number[];
      isActive?: boolean;
    }
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);

    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    // Check if updating name and it already exists
    if (data.name && data.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new Error(`Role with name "${data.name}" already exists`);
      }
    }

    // Update basic fields
    if (data.name) role.name = data.name;
    if (data.description !== undefined) role.description = data.description;
    if (data.isActive !== undefined) role.isActive = data.isActive;

    // Update permissions if provided
    if (data.permissionIds) {
      const permissions = await this.permissionRepository.findByIds(
        data.permissionIds
      );

      if (permissions.length !== data.permissionIds.length) {
        throw new Error("Some permissions not found");
      }

      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: number): Promise<void> {
    const role = await this.getRoleById(roleId);

    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    // Check if role has users
    if (role.users && role.users.length > 0) {
      throw new Error(
        `Cannot delete role "${role.name}" because it has ${role.users.length} user(s) assigned to it`
      );
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { permission: "ASC" },
    });
  }

  /**
   * Get role statistics
   */
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
