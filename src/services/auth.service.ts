import { AppDataSource } from "../config/typeorm";
import { User } from "../models/entities/user";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  EmailVerification,
  VerificationType,
} from "../models/entities/email-verification-code";
import { Notification, NotificationType } from "../models";
import { LessThan } from "typeorm";

const jwt = require("jsonwebtoken");
dotenv.config();

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private readonly JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

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
    password: string
  ): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    expiresAt?: Date;
    expiresIn?: string;
    message?: string;
  }> {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase().trim() },
        relations: ["role"], // Load role information
      });
      // Check if account is active
      if (!user?.isActive) {
        return {
          success: false,
          message: "Account is deactivated",
        };
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        return {
          success: false,
          message:
            "Account is temporarily locked due to too many failed login attempts",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.incrementFailedLoginAttempts(user);
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(user);

      // Update last login
      user.lastLogin = new Date();
      await this.userRepository.save(user);

      // Generate JWT token
      const token = this.generateToken(user);
      const expiresAt = this.getTokenExpiryTime();

      return {
        success: true,
        user,
        token,
        expiresAt,
        expiresIn: this.JWT_EXPIRES_IN,
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
          <p style="color: #666; margin: 5px 0;">Enterprise Resource Planning</p>
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
