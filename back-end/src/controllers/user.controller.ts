import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { formatRole } from "../utils/formatters";

const userService = new UserService();

export class UserController {
  /**
   * Get all users
   * GET /api/users
   * Query params: search, pageIndex, pageSize, roleId
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const search = req.query.search as string | undefined;
      const pageIndex = parseInt(req.query.pageIndex as string) || 0;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const roleId = req.query.roleId
        ? parseInt(req.query.roleId as string)
        : undefined;

      const { users, totalCount } = await userService.getAllUsers(
        search,
        pageIndex,
        pageSize,
        roleId
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
        employeeCode: user.employeeCode,
        role: user.role ? formatRole(user.role) : null,
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
        employeeCode: user.employeeCode,
        role: user.role ? formatRole(user.role) : null,
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
        employeeCode: user.employeeCode,
        role: user.role ? formatRole(user.role) : null,
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
   * Update user information
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await userService.updateUser(id, data);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
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

  /**
   * Create new user with auto-generated password
   * POST /api/users
   */
  async createUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, username, roleId, employeeCode } =
        req.body;

      // Validation
      if (!firstName || !lastName || !email || !roleId) {
        return res.status(400).json({
          success: false,
          message: "First name, last name, email, and role are required",
        });
      }

      const result = await userService.createUser({
        firstName,
        lastName,
        email,
        username,
        roleId: parseInt(roleId),
        employeeCode,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json({
        success: true,
        user: result.user,
        message: result.message,
      });
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Validate setup token
   * GET /api/users/setup/validate/:token
   */
  async validateSetupToken(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const result = await userService.validateSetupToken(token);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.json({
        success: true,
        user: {
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
        },
        message: "Valid setup token",
      });
    } catch (error) {
      console.error("Validate setup token error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Complete user setup with new password
   * POST /api/users/setup/complete
   */
  async completeUserSetup(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Token and password are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      const result = await userService.completeUserSetup(token, password);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Complete user setup error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Resend setup email to user
   * POST /api/users/:id/resend-setup
   */
  async resendSetupEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await userService.resendUserSetup(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Resend setup email error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export const userController = new UserController();
