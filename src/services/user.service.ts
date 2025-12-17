import { AppDataSource } from "../config/typeorm";
import { User } from "../models/entities/user";
import { Role } from "../models/entities/role";
import { Like } from "typeorm";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);

  /**
   * Get all users with their roles, optional search, and pagination
   */
  async getAllUsers(
    search?: string,
    pageIndex: number = 0,
    pageSize: number = 10
  ): Promise<{ users: User[]; totalCount: number }> {
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .leftJoinAndSelect("role.permissions", "permissions")
        .where("user.isActive = :isActive", { isActive: true })
        .orderBy("user.createdAt", "DESC");

      // Add search filter if provided
      if (search && search.trim()) {
        queryBuilder.andWhere(
          "(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)",
          { search: `%${search.trim()}%` }
        );
      }

      // Get total count for pagination
      const totalCount = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(pageIndex * pageSize).take(pageSize);

      const users = await queryBuilder.getMany();
      return { users, totalCount };
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  /**
   * Get user by ID with role
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { userId },
        relations: ["role", "role.permissions"],
      });
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: number): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { roleId },
        relations: ["role", "role.permissions"],
        order: {
          createdAt: "DESC",
        },
      });
      return users;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<{ success: boolean; message: string; user?: User }> {
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
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(
    userId: string,
    data: Partial<User>
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      console.log("updateUser called with userId:", userId);
      console.log("updateUser data:", data);
      console.log("roleId type:", typeof data.roleId, "value:", data.roleId);

      const user = await this.userRepository.findOne({
        where: { userId },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      console.log("Current user roleId:", user.roleId);

      // If role is being updated, verify it exists
      if (data.roleId) {
        const role = await this.roleRepository.findOne({
          where: { roleId: data.roleId },
        });

        console.log("Role lookup result:", role);

        if (!role) {
          return {
            success: false,
            message: "Role not found",
          };
        }
      }

      // Build update object
      const updateData: any = {};
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.roleId !== undefined) {
        console.log("Updating roleId from", user.roleId, "to", data.roleId);
        updateData.roleId = data.roleId;
      }
      if (data.employeeCode !== undefined)
        updateData.employeeCode = data.employeeCode;
      if (data.isEmailVerified !== undefined)
        updateData.isEmailVerified = data.isEmailVerified;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      console.log("Update data:", updateData);

      // Use direct UPDATE query to avoid entity manager cache issues
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set(updateData)
        .where("userId = :userId", { userId })
        .execute();

      console.log("User updated successfully with direct query");

      // Fetch updated user with role relations using a fresh query
      const updatedUser = await this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .leftJoinAndSelect("role.permissions", "permissions")
        .where("user.userId = :userId", { userId })
        .getOne();

      console.log("Fetched updated user:", {
        userId: updatedUser?.userId,
        roleId: updatedUser?.roleId,
        roleName: updatedUser?.role?.name,
      });

      return {
        success: true,
        message: "User updated successfully",
        user: updatedUser || undefined,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    roleId: number
  ): Promise<{ success: boolean; message: string; user?: User }> {
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

      // Fetch updated user with role relations
      const updatedUser = await this.getUserById(userId);

      return {
        success: true,
        message: "User role updated successfully",
        user: updatedUser || undefined,
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { roleId: number; roleName: string; count: number }[];
  }> {
    try {
      const total = await this.userRepository.count();
      const active = await this.userRepository.count({
        where: { isActive: true },
      });
      const inactive = await this.userRepository.count({
        where: { isActive: false },
      });

      // Get count by role
      const roles = await this.roleRepository.find();
      const byRole = await Promise.all(
        roles.map(async (role) => ({
          roleId: role.roleId,
          roleName: role.name,
          count: await this.userRepository.count({
            where: { roleId: role.roleId },
          }),
        }))
      );

      return {
        total,
        active,
        inactive,
        byRole,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }
}
