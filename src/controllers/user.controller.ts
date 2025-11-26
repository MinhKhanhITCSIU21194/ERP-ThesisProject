import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  /**
   * Get all users
   * GET /api/users
   * Query params: search, pageIndex, pageSize
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const search = req.query.search as string | undefined;
      const pageIndex = parseInt(req.query.pageIndex as string) || 0;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const { users, totalCount } = await userService.getAllUsers(
        search,
        pageIndex,
        pageSize
      );

      // Format response to exclude sensitive data
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
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Format response to exclude sensitive data
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
    } catch (error) {
      console.error("Get user by ID error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get users by role
   * GET /api/users/role/:roleId
   */
  async getUsersByRole(req: Request, res: Response) {
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

      // Format response to exclude sensitive data
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
    } catch (error) {
      console.error("Get users by role error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update user status (activate/deactivate)
   * PATCH /api/users/:id/status
   */
  async updateUserStatus(req: Request, res: Response) {
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
    } catch (error) {
      console.error("Update user status error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update user role
   * PATCH /api/users/:id/role
   */
  async updateUserRole(req: Request, res: Response) {
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
    } catch (error) {
      console.error("Update user role error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  async getUserStats(req: Request, res: Response) {
    try {
      const stats = await userService.getUserStats();

      return res.json({
        success: true,
        stats,
        message: "User statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export const userController = new UserController();
