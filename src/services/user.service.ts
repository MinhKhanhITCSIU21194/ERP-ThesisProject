import { AppDataSource } from "../config/typeorm";
import { User } from "../models/entities/user";
import { Role } from "../models/entities/role";
import { Like } from "typeorm";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Get all users with their roles, optional search, and pagination
   */
  async getAllUsers(
    search?: string,
    pageIndex: number = 0,
    pageSize: number = 10,
    roleId?: number
  ): Promise<{ users: User[]; totalCount: number }> {
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .leftJoinAndSelect("role.rolePermissions", "rolePermissions")
        .leftJoinAndSelect("rolePermissions.permission", "permission")
        .where("user.isActive = :isActive", { isActive: true })
        .orderBy("user.createdAt", "DESC");

      // Add role filter if provided
      if (roleId) {
        queryBuilder.andWhere("user.roleId = :roleId", { roleId });
      }

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
        relations: [
          "role",
          "role.rolePermissions",
          "role.rolePermissions.permission",
        ],
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
        relations: [
          "role",
          "role.rolePermissions",
          "role.rolePermissions.permission",
        ],
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
        .leftJoinAndSelect("role.rolePermissions", "rolePermissions")
        .leftJoinAndSelect("rolePermissions.permission", "permission")
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
   * Generate setup token with 2-week expiry
   */
  private generateSetupToken(): { token: string; expiry: Date } {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14); // 2 weeks from now
    return { token, expiry };
  }

  /**
   * Create a new user with auto-generated password and setup email
   */
  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    roleId: number;
    employeeCode?: string;
    isEmailVerified?: boolean;
    createdBy?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          message: "Email already exists",
        };
      }

      // Verify role exists
      const role = await this.roleRepository.findOne({
        where: { roleId: data.roleId },
      });

      if (!role) {
        return {
          success: false,
          message: "Role not found",
        };
      }

      // Generate temporary password
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Generate setup token
      const { token, expiry } = this.generateSetupToken();

      // Create user
      const user = this.userRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username || data.email.split("@")[0],
        passwordHash,
        roleId: data.roleId,
        employeeCode: data.employeeCode,
        isEmailVerified: data.isEmailVerified || false,
        isActive: true,
        setupToken: token,
        setupTokenExpiry: expiry,
      });

      await this.userRepository.save(user);

      // Send setup email
      await this.sendSetupEmail(user, token);

      // Fetch user with role relations
      const createdUser = await this.getUserById(user.userId);

      return {
        success: true,
        message: "User created successfully. Setup email sent.",
        user: createdUser || undefined,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Send setup email to new user
   */
  private async sendSetupEmail(user: User, token: string): Promise<boolean> {
    try {
      const setupLink = `${process.env.FRONTEND_URL}/auth/setup-account?token=${token}`;
      const expiryDays = 14;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Welcome! Complete Your Account Setup",
        html: this.getSetupEmailTemplate(
          user.firstName,
          user.lastName,
          setupLink,
          expiryDays
        ),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Setup email sent successfully to ${user.email}`);
      return true;
    } catch (error) {
      console.error("Error sending setup email:", error);
      return false;
    }
  }

  /**
   * Email template for user setup
   */
  private getSetupEmailTemplate(
    firstName: string,
    lastName: string,
    setupLink: string,
    expiryDays: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f5f5f5; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our ERP System</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName} ${lastName},</h2>
              <p>Your account has been created successfully! To complete your setup and access the system, please set your password using the link below.</p>
              
              <div style="text-align: center;">
                <a href="${setupLink}" class="button">Complete Account Setup</a>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in ${expiryDays} days</li>
                <li>You will need to create a secure password</li>
                <li>After setup, you can log in using your email and password</li>
              </ul>
              
              <p>If you did not expect this email or have any questions, please contact your administrator.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} ERP System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Validate setup token
   */
  async validateSetupToken(token: string): Promise<{
    valid: boolean;
    user?: User;
    message?: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { setupToken: token },
        relations: ["role"],
      });

      if (!user) {
        return { valid: false, message: "Invalid setup token" };
      }

      if (user.setupTokenExpiry && new Date() > user.setupTokenExpiry) {
        return { valid: false, message: "Setup token has expired" };
      }

      return { valid: true, user };
    } catch (error) {
      console.error("Error validating setup token:", error);
      throw error;
    }
  }

  /**
   * Complete user setup - set new password
   */
  async completeUserSetup(
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const validation = await this.validateSetupToken(token);

      if (!validation.valid || !validation.user) {
        return {
          success: false,
          message: validation.message || "Invalid token",
        };
      }

      const user = validation.user;

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update user with new password and clear setup token
      await this.userRepository.update(user.userId, {
        passwordHash,
        setupToken: undefined,
        setupTokenExpiry: undefined,
        isEmailVerified: true,
        passwordChangedAt: new Date(),
      });

      const updatedUser = await this.getUserById(user.userId);

      return {
        success: true,
        message: "Account setup completed successfully",
        user: updatedUser || undefined,
      };
    } catch (error) {
      console.error("Error completing user setup:", error);
      throw error;
    }
  }

  /**
   * Resend setup email to user
   */
  async resendUserSetup(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.getUserById(userId);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          message: "User has already completed setup",
        };
      }

      // Generate new setup token
      const { token, expiry } = this.generateSetupToken();

      // Update user with new token
      user.setupToken = token;
      user.setupTokenExpiry = expiry;
      await this.userRepository.save(user);

      // Resend setup email
      const emailSent = await this.sendSetupEmail(user, token);

      if (!emailSent) {
        return {
          success: false,
          message: "Failed to send setup email",
        };
      }

      return {
        success: true,
        message: "Setup email resent successfully",
      };
    } catch (error) {
      console.error("Error resending setup email:", error);
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
