import { Request, Response } from "express";
import { RoleService } from "../services/role.service";
import { AuthRequest } from "../middleware/auth.middleware";

class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  /**
   * Get all roles with pagination
   * GET /api/roles
   */
  async getRoles(req: Request, res: Response) {
    try {
      const pageIndex = parseInt(req.query.pageIndex as string) || 0;
      const pageSize = Math.min(
        parseInt(req.query.pageSize as string) || 10,
        100
      );

      const result = await this.roleService.getRoles(pageIndex, pageSize);

      res.status(200).json({
        success: true,
        data: result.roles,
        totalCount: result.total,
        pageIndex: result.pageIndex,
        pageSize: result.pageSize,
      });
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch roles",
        error: error.message,
      });
    }
  }

  /**
   * Get role by ID
   * GET /api/roles/:id
   */
  async getRoleById(req: Request, res: Response) {
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
    } catch (error: any) {
      console.error("Error fetching role:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch role",
        error: error.message,
      });
    }
  }

  /**
   * Create a new role
   * POST /api/roles
   */
  async createRole(req: AuthRequest, res: Response) {
    try {
      const { name, description, permissionIds, permissions } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Role name is required",
        });
      }

      // Accept either permissionIds (old format) or permissions (new format)
      if (
        (!permissionIds || !Array.isArray(permissionIds)) &&
        (!permissions || !Array.isArray(permissions))
      ) {
        return res.status(400).json({
          success: false,
          message: "Either permissionIds or permissions array is required",
        });
      }

      const role = await this.roleService.createRole({
        name,
        description,
        permissionIds,
        permissions,
        createdBy: req.user?.userId,
      });

      res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: role,
      });
    } catch (error: any) {
      console.error("Error creating role:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create role",
      });
    }
  }

  /**
   * Update a role
   * PUT /api/roles/:id
   */
  async updateRole(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);

      if (isNaN(roleId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role ID",
        });
      }

      const { name, description, permissionIds, permissions, isActive } =
        req.body;

      const role = await this.roleService.updateRole(roleId, {
        name,
        description,
        permissionIds,
        permissions,
        isActive,
      });

      res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: role,
      });
    } catch (error: any) {
      console.error("Error updating role:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update role",
      });
    }
  }

  /**
   * Delete a role
   * DELETE /api/roles/:id
   */
  async deleteRole(req: Request, res: Response) {
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
    } catch (error: any) {
      console.error("Error deleting role:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete role",
      });
    }
  }

  /**
   * Get all available permissions
   * GET /api/roles/permissions
   */
  async getPermissions(req: Request, res: Response) {
    try {
      const permissions = await this.roleService.getAllPermissions();

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch permissions",
        error: error.message,
      });
    }
  }

  /**
   * Get role statistics
   * GET /api/roles/stats
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await this.roleService.getRoleStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
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
export default roleController;
