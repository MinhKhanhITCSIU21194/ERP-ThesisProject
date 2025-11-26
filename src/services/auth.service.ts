import { AppDataSource } from "../config/typeorm";
import { User } from "../models/entities/user";
import { Session } from "../models/entities/session";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  EmailVerification,
  VerificationType,
} from "../models/entities/email-verification-code";
import { Notification, NotificationType } from "../models";
import { LessThan, MoreThan } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { formatRole } from "../utils/formatters";

const jwt = require("jsonwebtoken");
dotenv.config();

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private sessionRepository = AppDataSource.getRepository(Session);
  private readonly JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m";
  private readonly REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "fallback-refresh-secret";
  private readonly REFRESH_TOKEN_EXPIRES_IN =
    process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

  // Helper method to calculate token expiry timestamp
  private getTokenExpiryTime(): Date {
    const expiresIn = this.JWT_EXPIRES_IN;
    let expiryTime = new Date();

    // Parse the expiration time (e.g., "1d", "24h", "1440m", "86400s")
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case "d": // days
          expiryTime.setDate(expiryTime.getDate() + value);
          break;
        case "h": // hours
          expiryTime.setHours(expiryTime.getHours() + value);
          break;
        case "m": // minutes
          expiryTime.setMinutes(expiryTime.getMinutes() + value);
          break;
        case "s": // seconds
          expiryTime.setSeconds(expiryTime.getSeconds() + value);
          break;
        default:
          // Default to 24 hours if format is unrecognized
          expiryTime.setHours(expiryTime.getHours() + 24);
      }
    } else {
      // Default to 24 hours if format is unrecognized
      expiryTime.setHours(expiryTime.getHours() + 24);
    }

    return expiryTime;
  }

  async checkEmailExists(
    email: string
  ): Promise<{ exists: boolean; user?: User }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });
      return {
        exists: !!user,
        user: user || undefined,
      };
    } catch (error) {
      console.error("Error checking email existence:", error);
      return {
        exists: false,
        user: undefined,
      };
    }
  }

  async signIn(
    email: string,
    password: string,
    req?: any,
    res?: any
  ): Promise<{
    success: boolean;
    user?: any;
    accessToken?: string;
    refreshToken?: string;
    sessionId?: string;
    expiresAt?: Date;
    expiresIn?: string;
    message?: string;
    accountLocked?: boolean;
    lockoutTime?: Date;
    remainingAttempts?: number;
    emailVerificationRequired?: boolean;
  }> {
    try {
      // Find user by email with relationships (include role permissions)
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
        relations: ["role", "role.permissions"],
      });

      if (!user) {
        // Simulate timing to prevent email enumeration
        await bcrypt.hash("dummy", 12);
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Check if account is active
      if (!user?.isActive) {
        return {
          success: false,
          message: "Account is deactivated",
        };
      }
      // Check if account is locked
      if (user.isAccountLocked()) {
        const lockoutEndTime = user.accountLockedUntil;
        const remainingTime = lockoutEndTime
          ? Math.ceil((lockoutEndTime.getTime() - new Date().getTime()) / 60000)
          : 0;

        return {
          success: false,
          message: `Account is temporarily locked. Try again in ${remainingTime} minutes.`,
          accountLocked: true,
          lockoutTime: lockoutEndTime,
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        console.log("Password verification failed for user:", email);

        // Increment failed login attempts
        await this.incrementFailedLoginAttempts(user);

        const maxAttempts = 5;
        const remainingAttempts = maxAttempts - user.failedLoginAttempts;

        if (user.failedLoginAttempts >= maxAttempts) {
          return {
            success: false,
            message:
              "Account locked due to too many failed attempts. Try again in 30 minutes.",
            accountLocked: true,
            lockoutTime: user.accountLockedUntil,
            remainingAttempts: 0,
          };
        } else {
          return {
            success: false,
            message: "Invalid email or password",
            remainingAttempts,
          };
        }
      }
      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(user);

      // Generate tokens and create session
      const accessToken = this.generateToken(user);
      const expiresAt = this.getTokenExpiryTime();
      const { sessionId, refreshToken } = await this.createSession(user, req);

      // Set cookies if response object is provided
      if (res) {
        const { CookieService } = await import("./cookie.service");
        const cookieService = new CookieService();
        cookieService.setAccessTokenCookie(res, accessToken);
        cookieService.setRefreshTokenCookie(res, refreshToken);
        cookieService.setSessionCookie(res, sessionId);
      } else {
        console.log("⚠️ No response object provided - cookies NOT set");
      }

      // Update last login
      user.lastLogin = new Date();
      await this.userRepository.save(user);

      // Get unread notifications count if notifications exist
      const notificationRepository = AppDataSource.getRepository(Notification);
      const unreadNotifications = await notificationRepository.count({
        where: {
          recipientUserId: user.userId,
          isRead: false,
        },
      });

      // Get employee UUID if user has an employee record
      const { Employee } = await import("../models/entities/employee");
      const employeeRepository = AppDataSource.getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { userId: user.userId },
        select: ["employeeId"],
      });

      // Prepare user data for response (excluding sensitive fields)
      const userData = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        employeeId: employee?.employeeId, // Employee UUID, not employee code
        role: formatRole(user.role),
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        unreadNotifications,
      };

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        sessionId,
        expiresAt,
        expiresIn: this.JWT_EXPIRES_IN,
        message: "Login successful",
      };
    } catch (error) {
      console.error("SignIn error:", error);
      return {
        success: false,
        message: "An error occurred during sign in",
      };
    }
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.userId,
      email: user.email,
      roleId: user.roleId,
      role: user.role, // Include full role with permissions
    };

    if (!this.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    return (jwt as any).sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private async incrementFailedLoginAttempts(user: User): Promise<void> {
    user.failedLoginAttempts += 1;
    // Lock account after 5 failed attempts for 30 minutes
    if (user.failedLoginAttempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 2);
      user.accountLockedUntil = lockUntil;
    }
    await this.userRepository.save(user);
  }

  private async resetFailedLoginAttempts(user: User): Promise<void> {
    if (user.failedLoginAttempts > 0 || user.accountLockedUntil) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = undefined;
      await this.userRepository.save(user);
    }
  }

  async hashPassword(password: string) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Set new password and automatically sign user in
  async setNewPassword(
    email: string, // Can be email or userId
    newPassword: string,
    confirmPassword?: string,
    req?: any,
    res?: any
  ): Promise<{
    success: boolean;
    user?: any;
    accessToken?: string;
    refreshToken?: string;
    sessionId?: string;
    expiresAt?: Date;
    expiresIn?: string;
    message?: string;
    errors?: string[];
  }> {
    try {
      const errors: string[] = [];

      // Validate password confirmation if provided
      if (confirmPassword && newPassword !== confirmPassword) {
        errors.push("Passwords do not match");
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: "Password validation failed",
          errors,
        };
      }

      // Find user by email or userId - REMOVED receivedNotifications to avoid entity tracking issues
      console.log("Looking up user with email/userId:", email);
      let user = await this.userRepository.findOne({
        where: [{ email: email.toLowerCase().trim() }],
        relations: ["role", "role.permissions"], // Load role with permissions
      });

      // If not found by email, try by userId (in case email is actually a UUID)
      if (!user && email.length === 36) {
        console.log("Trying to find user by UUID:", email);
        user = await this.userRepository.findOne({
          where: [{ userId: email }],
          relations: ["role", "role.permissions"], // Load role with permissions
        });
      }

      console.log("User found:", {
        userId: user?.userId,
        email: user?.email,
        isActive: user?.isActive,
        hasUserId: !!user?.userId,
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (!user.userId) {
        console.error("User found but userId is null/undefined:", user);
        return {
          success: false,
          message: "User data is invalid - missing user ID",
        };
      }

      // Check if account is active
      if (!user.isActive) {
        return {
          success: false,
          message: "Account is deactivated",
        };
      }

      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password and related fields
      user.passwordHash = hashedPassword;
      user.passwordChangedAt = new Date();
      user.failedLoginAttempts = 0; // Reset failed attempts
      user.accountLockedUntil = undefined; // Unlock account if locked

      // Save updated user
      console.log("Saving user with userId:", user.userId);
      const savedUser = await this.userRepository.save(user);
      console.log("User saved. SavedUser details:", {
        userId: savedUser.userId,
        email: savedUser.email,
        hasUserId: !!savedUser.userId,
        userIdType: typeof savedUser.userId,
        userIdValue: savedUser.userId,
      });

      // Create notification about password change
      // Use a separate try-catch and potentially separate transaction for notification
      if (savedUser.userId) {
        try {
          console.log("Creating notification for user:", {
            userId: savedUser.userId,
            email: savedUser.email,
          });

          const notificationRepository =
            AppDataSource.getRepository(Notification);

          // Use a query runner for a separate transaction
          const queryRunner = AppDataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            const result = await queryRunner.query(
              `INSERT INTO notifications (title, message, type, "isRead", "recipientUserId", "createdAt") 
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING "notificationId"`,
              [
                "Password Changed",
                "Your password has been successfully updated",
                "success",
                false,
                savedUser.userId,
                new Date(),
              ]
            );

            await queryRunner.commitTransaction();
            console.log(
              "Password change notification created successfully via raw query:",
              result
            );
          } catch (queryError) {
            await queryRunner.rollbackTransaction();
            throw queryError;
          } finally {
            await queryRunner.release();
          }
        } catch (notificationError) {
          console.error(
            "Failed to create password change notification:",
            notificationError
          );
          // Don't fail the entire operation if notification creation fails
        }
      } else {
        console.warn(
          "Skipping notification creation - savedUser.userId is null"
        );
      }

      // Automatically sign the user in after password change
      const accessToken = this.generateToken(savedUser);
      const expiresAt = this.getTokenExpiryTime();
      const { sessionId, refreshToken } = await this.createSession(
        savedUser,
        req
      );

      // Set cookies if response object is provided
      if (res) {
        const { CookieService } = await import("./cookie.service");
        const cookieService = new CookieService();
        cookieService.setAccessTokenCookie(res, accessToken);
        cookieService.setRefreshTokenCookie(res, refreshToken);
        cookieService.setSessionCookie(res, sessionId);
      }

      // Update last login
      savedUser.lastLogin = new Date();
      await this.userRepository.save(savedUser);

      // Get unread notifications count separately to avoid loading all notifications into entity manager
      const notificationRepository = AppDataSource.getRepository(Notification);
      const unreadNotifications = await notificationRepository.count({
        where: {
          recipientUserId: savedUser.userId,
          isRead: false,
        },
      });

      // Get employee UUID if user has an employee record
      const { Employee } = await import("../models/entities/employee");
      const employeeRepository = AppDataSource.getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { userId: savedUser.userId },
        select: ["employeeId"],
      });

      // Prepare user data for response
      const userData = {
        userId: savedUser.userId,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        employeeId: employee?.employeeId,
        role: formatRole(savedUser.role),
        isEmailVerified: savedUser.isEmailVerified,
        lastLogin: savedUser.lastLogin,
        createdAt: savedUser.createdAt,
        unreadNotifications: unreadNotifications, // Just the count, no +1 since we're not creating notification yet
      };

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        sessionId,
        expiresAt,
        expiresIn: this.JWT_EXPIRES_IN,
        message: "Password updated successfully and user signed in",
      };
    } catch (error) {
      console.error("Set new password error:", error);
      return {
        success: false,
        message: "An error occurred while setting new password",
      };
    }
  }

  // Validate password strength
  private validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!password) {
      errors.push("Password is required");
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must not exceed 128 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    // Check for common weak passwords
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Password is too common, please choose a stronger password");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Generate refresh token
  private generateRefreshToken(user: User, sessionId: string): string {
    const payload = {
      userId: user.userId,
      sessionId: sessionId,
      type: "refresh",
      jti: uuidv4(), // Unique token ID for revocation
    };

    return (jwt as any).sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  // Create session with refresh token
  async createSession(
    user: User,
    req: any
  ): Promise<{
    sessionId: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const sessionId = uuidv4();
    const refreshToken = this.generateRefreshToken(user, sessionId);

    // Calculate refresh token expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = new Session();
    session.sessionId = sessionId;
    session.userId = user.userId;
    session.sessionToken = sessionId; // For backwards compatibility
    session.refreshToken = refreshToken;
    session.ipAddress = req?.ip || null;
    session.userAgent = req?.get("User-Agent") || null;
    session.isActive = true;
    session.expiresAt = expiresAt;
    session.lastActivity = new Date();

    await this.sessionRepository.save(session);

    return {
      sessionId,
      refreshToken,
      expiresAt,
    };
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    expiresAt?: Date;
    user?: User;
    error?: string;
  }> {
    try {
      // Verify refresh token
      const decoded = (jwt as any).verify(
        refreshToken,
        this.REFRESH_TOKEN_SECRET
      ) as any;

      if (decoded.type !== "refresh") {
        return { success: false, error: "Invalid token type" };
      }

      // Find session (include role permissions for authorization)
      const session = await this.sessionRepository.findOne({
        where: {
          sessionId: decoded.sessionId,
          refreshToken: refreshToken,
          isActive: true,
        },
        relations: ["user", "user.role", "user.role.permissions"],
      });

      if (!session || session.expiresAt < new Date()) {
        return { success: false, error: "Session expired or invalid" };
      }

      // Update last activity
      session.lastActivity = new Date();
      await this.sessionRepository.save(session);

      // Get employee UUID if user has an employee record
      const { Employee } = await import("../models/entities/employee");
      const employeeRepository = AppDataSource.getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { userId: session.user.userId },
        select: ["employeeId"],
      });

      // Add employee UUID to user object
      const userWithEmployee = {
        ...session.user,
        employeeId: employee?.employeeId,
      };

      // Generate new access token
      const accessToken = this.generateToken(session.user);
      const expiresAt = this.getTokenExpiryTime();

      return {
        success: true,
        accessToken,
        expiresAt,
        user: userWithEmployee,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return { success: false, error: "Invalid refresh token" };
    }
  }

  // Logout - invalidate session
  async logout(
    sessionId?: string,
    refreshToken?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (sessionId) {
        await this.sessionRepository.update({ sessionId }, { isActive: false });
      } else if (refreshToken) {
        // Find session by refresh token
        const decoded = (jwt as any).verify(
          refreshToken,
          this.REFRESH_TOKEN_SECRET
        ) as any;
        await this.sessionRepository.update(
          { sessionId: decoded.sessionId },
          { isActive: false }
        );
      }

      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: "Logout failed" };
    }
  }

  // Logout from all devices
  async logoutFromAllDevices(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.sessionRepository.update(
        { userId, isActive: true },
        { isActive: false }
      );

      return { success: true, message: "Logged out from all devices" };
    } catch (error) {
      console.error("Logout all error:", error);
      return { success: false, message: "Logout failed" };
    }
  }

  // Get active sessions for user
  async getActiveSessions(userId: string): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      },
      order: { lastActivity: "DESC" },
    });
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository.update(
      {
        expiresAt: LessThan(new Date()),
        isActive: true,
      },
      { isActive: false }
    );
    return result.affected || 0;
  }
}
// ---------------------------------------------------------------------------------------------------------------------------------//
// --------------------------------------------------Email class--------------------------------------------------------------------//
// ---------------------------------------------------------------------------------------------------------------------------------//
export class EmailService {
  private userRepository = AppDataSource.getRepository(User);
  private verificationRepository =
    AppDataSource.getRepository(EmailVerification);
  private notificationRepository = AppDataSource.getRepository(Notification);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    req?: any
  ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        return { success: false, message: "Email not found in our system" };
      }

      // Check for existing active verification
      const existingVerification = await this.verificationRepository.findOne({
        where: {
          userId: user.userId,
          email: email.toLowerCase().trim(),
          verificationType: VerificationType.EMAIL_VERIFICATION,
          isUsed: false,
        },
        order: { createdAt: "DESC" },
      });

      // If active verification exists and user has exceeded attempts
      if (existingVerification && !existingVerification.canAttempt()) {
        return {
          success: false,
          message: "Too many verification attempts. Please try again later.",
        };
      }

      // Generate 6-digit verification code
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create new verification record
      const verification = new EmailVerification();
      verification.userId = user.userId;
      verification.email = email.toLowerCase().trim();
      verification.code = verifyCode;
      verification.verificationType = VerificationType.EMAIL_VERIFICATION;
      verification.expiresAt = expiryTime;
      verification.ipAddress = req?.ip || null;
      verification.userAgent = req?.get("User-Agent") || null;

      await this.verificationRepository.save(verification);

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification - ERP System",
        html: this.getVerificationEmailTemplate(user.firstName, verifyCode, 10),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent:", result.messageId);

      // Create notification for user
      await this.createNotification(
        user.userId,
        "Email Verification Code Sent",
        `A verification code has been sent to ${email}`,
        NotificationType.INFO
      );

      return {
        success: true,
        message: "Verification code sent successfully",
        expiresIn: 10, // minutes
      };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, message: "Failed to send verification email" };
    }
  }

  async verifyEmailCode(
    email: string,
    code: string,
    req?: any
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        return { success: false, message: "Email not found" };
      }

      // Find the verification record
      const verification = await this.verificationRepository.findOne({
        where: {
          userId: user.userId,
          email: email.toLowerCase().trim(),
          verificationType: VerificationType.EMAIL_VERIFICATION,
          isUsed: false,
        },
        order: { createdAt: "DESC" },
      });

      if (!verification) {
        return {
          success: false,
          message: "No verification code found. Please request a new one.",
        };
      }

      // Check if too many attempts
      if (!verification.canAttempt()) {
        return {
          success: false,
          message:
            "Too many failed attempts. Please request a new verification code.",
        };
      }

      // Increment attempt count
      verification.incrementAttempt();

      // Check if expired
      if (verification.isExpired()) {
        await this.verificationRepository.save(verification);
        return {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        };
      }

      // Check if code matches
      if (verification.code !== code) {
        await this.verificationRepository.save(verification);
        const remainingAttempts = 5 - verification.attemptCount;
        return {
          success: false,
          message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
        };
      }

      // Success! Mark as used and update user
      verification.markAsUsed();
      await this.verificationRepository.save(verification);

      // Update user's email verification status
      user.isEmailVerified = true;
      await this.userRepository.save(user);

      // Create success notification
      await this.createNotification(
        user.userId,
        "Email Verified Successfully",
        "Your email address has been verified successfully.",
        NotificationType.SUCCESS
      );

      return {
        success: true,
        message: "Email verified successfully",
        user: user,
      };
    } catch (error) {
      console.error("Email verification failed:", error);
      return { success: false, message: "Verification failed" };
    }
  }

  private getVerificationEmailTemplate(
    firstName: string,
    code: string,
    expiryMinutes: number
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">ERP System</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; text-align: center; margin-top: 0;">Email Verification</h2>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Hello <strong>${firstName}</strong>,
          </p>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
            Please use the following verification code to complete your email verification:
          </p>
          
          <div style="background-color: white; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
            <div style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⏰ <strong>Important:</strong> This code will expire in <strong>${expiryMinutes} minutes</strong>
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 25px;">
            If you didn't request this verification, please ignore this email or contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This is an automated message from ERP System. Please do not reply to this email.
          </p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
            © ${new Date().getFullYear()} ERP System. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  private async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType
  ): Promise<void> {
    try {
      const notification = new Notification();
      notification.recipientUserId = userId;
      notification.title = title;
      notification.message = message;
      notification.type = type;

      await this.notificationRepository.save(notification);
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  // Get verification history for user (admin feature)
  async getVerificationHistory(userId: string): Promise<EmailVerification[]> {
    return await this.verificationRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 10, // Last 10 verifications
    });
  }

  // Clean up expired verifications (cleanup job)
  async cleanupExpiredVerifications(): Promise<number> {
    const result = await this.verificationRepository.delete({
      expiresAt: LessThan(new Date()),
      isUsed: false,
    });
    return result.affected || 0;
  }
}
