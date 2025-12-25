import { AppDataSource } from "../config/typeorm";
import { Role } from "../models/entities/role";
import { Permission } from "../models/entities/permission";
import { RolePermission } from "../models/entities/role-permission";
import { Repository } from "typeorm";

export class RoleService {
  private roleRepository: Repository<Role>;
  private permissionRepository: Repository<Permission>;
  private rolePermissionRepository: Repository<RolePermission>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
    this.permissionRepository = AppDataSource.getRepository(Permission);
    this.rolePermissionRepository = AppDataSource.getRepository(RolePermission);
  }

  /**
   * Get all roles with pagination
   */
  async getRoles(pageIndex: number = 0, pageSize: number = 10) {
    const [roles, total] = await this.roleRepository.findAndCount({
      relations: ["rolePermissions", "rolePermissions.permission", "users"],
      skip: pageIndex * pageSize,
      take: pageSize,
      order: { createdAt: "DESC" },
    });

    return {
      roles: roles.map((role) => ({
        ...role,
        userCount: role.users?.length || 0,
        // Map rolePermissions to permissions format for frontend compatibility
        permissions:
          role.rolePermissions?.map((rp) => ({
            id: rp.permissionId,
            permission: rp.permission.permission,
            name: rp.permission.name,
            canView: rp.canView,
            canRead: rp.canRead,
            canCreate: rp.canCreate,
            canUpdate: rp.canUpdate,
            canDelete: rp.canDelete,
            canPermanentlyDelete: rp.canPermanentlyDelete,
            canSetPermission: rp.canSetPermission,
            canImport: rp.canImport,
            canExport: rp.canExport,
            canSubmit: rp.canSubmit,
            canCancel: rp.canCancel,
            canApprove: rp.canApprove,
            canReject: rp.canReject,
            canAssign: rp.canAssign,
            canViewSalary: rp.canViewSalary,
            canEditSalary: rp.canEditSalary,
            canViewBenefit: rp.canViewBenefit,
            canReport: rp.canReport,
            canViewPartial: rp.canViewPartial,
            canViewBelongTo: rp.canViewBelongTo,
            canViewOwner: rp.canViewOwner,
            createdBy: rp.createdBy,
            updatedBy: rp.updatedBy,
            createdAt: rp.createdAt,
            updatedAt: rp.updatedAt,
          })) || [],
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
      relations: ["rolePermissions", "rolePermissions.permission", "users"],
    });
  }

  /**
   * Create a new role
   */
  async createRole(data: {
    name: string;
    description?: string;
    permissionIds?: number[];
    permissions?: Array<{
      id: number;
      permission: string;
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
    }>;
    createdBy?: string;
  }): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: data.name },
    });

    if (existingRole) {
      throw new Error(`Role with name "${data.name}" already exists`);
    }

    // Create role
    const role = this.roleRepository.create({
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
    });

    const savedRole = await this.roleRepository.save(role);

    // Handle permissions - full permission objects with individual flags
    if (data.permissions && data.permissions.length > 0) {
      const rolePermissions: RolePermission[] = [];

      for (const perm of data.permissions) {
        const permission = await this.permissionRepository.findOne({
          where: { id: perm.id },
        });

        if (!permission) {
          throw new Error(`Permission with ID ${perm.id} not found`);
        }

        const rolePermission = this.rolePermissionRepository.create({
          roleId: savedRole.roleId,
          permissionId: permission.id,
          canView: perm.canView || false,
          canRead: perm.canRead || false,
          canCreate: perm.canCreate || false,
          canUpdate: perm.canUpdate || false,
          canDelete: perm.canDelete || false,
          canPermanentlyDelete: perm.canPermanentlyDelete || false,
          canSetPermission: perm.canSetPermission || false,
          canImport: perm.canImport || false,
          canExport: perm.canExport || false,
          canSubmit: perm.canSubmit || false,
          canCancel: perm.canCancel || false,
          canApprove: perm.canApprove || false,
          canReject: perm.canReject || false,
          canAssign: perm.canAssign || false,
          canViewSalary: perm.canViewSalary || false,
          canEditSalary: perm.canEditSalary || false,
          canViewBenefit: perm.canViewBenefit || false,
          canReport: perm.canReport || false,
          canViewPartial: perm.canViewPartial || false,
          canViewBelongTo: perm.canViewBelongTo || false,
          canViewOwner: perm.canViewOwner || false,
          createdBy: data.createdBy,
        });

        rolePermissions.push(rolePermission);
      }

      await this.rolePermissionRepository.save(rolePermissions);
    }

    // Return role with permissions loaded
    return (await this.getRoleById(savedRole.roleId))!;
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
      permissions?: Array<{
        id: number;
        permission: string;
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
      }>;
      isActive?: boolean;
      updatedBy?: string;
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

    await this.roleRepository.save(role);

    // Update permissions if provided
    if (data.permissions && data.permissions.length > 0) {
      // Delete all existing role permissions for this role
      await this.rolePermissionRepository.delete({ roleId: role.roleId });

      // Create new role permissions
      const rolePermissions: RolePermission[] = [];

      for (const perm of data.permissions) {
        const permission = await this.permissionRepository.findOne({
          where: { id: perm.id },
        });

        if (!permission) {
          throw new Error(`Permission with ID ${perm.id} not found`);
        }

        const rolePermission = this.rolePermissionRepository.create({
          roleId: role.roleId,
          permissionId: permission.id,
          canView: perm.canView || false,
          canRead: perm.canRead || false,
          canCreate: perm.canCreate || false,
          canUpdate: perm.canUpdate || false,
          canDelete: perm.canDelete || false,
          canPermanentlyDelete: perm.canPermanentlyDelete || false,
          canSetPermission: perm.canSetPermission || false,
          canImport: perm.canImport || false,
          canExport: perm.canExport || false,
          canSubmit: perm.canSubmit || false,
          canCancel: perm.canCancel || false,
          canApprove: perm.canApprove || false,
          canReject: perm.canReject || false,
          canAssign: perm.canAssign || false,
          canViewSalary: perm.canViewSalary || false,
          canEditSalary: perm.canEditSalary || false,
          canViewBenefit: perm.canViewBenefit || false,
          canReport: perm.canReport || false,
          canViewPartial: perm.canViewPartial || false,
          canViewBelongTo: perm.canViewBelongTo || false,
          canViewOwner: perm.canViewOwner || false,
          updatedBy: data.updatedBy,
        });

        rolePermissions.push(rolePermission);
      }

      await this.rolePermissionRepository.save(rolePermissions);
    }

    // Return role with permissions loaded
    return (await this.getRoleById(role.roleId))!;
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
