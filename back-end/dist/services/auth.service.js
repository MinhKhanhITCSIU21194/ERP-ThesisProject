"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = exports.AuthService = void 0;
const typeorm_1 = require("../config/typeorm");
const user_1 = require("../models/entities/user");
const session_1 = require("../models/entities/session");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_verification_code_1 = require("../models/entities/email-verification-code");
const models_1 = require("../models");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const formatters_1 = require("../utils/formatters");
const jwt = require("jsonwebtoken");
dotenv_1.default.config();
class AuthService {
    constructor() {
        this.userRepository = typeorm_1.AppDataSource.getRepository(user_1.User);
        this.sessionRepository = typeorm_1.AppDataSource.getRepository(session_1.Session);
        this.JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m";
        this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "fallback-refresh-secret";
        this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
    }
    getTokenExpiryTime() {
        const expiresIn = this.JWT_EXPIRES_IN;
        let expiryTime = new Date();
        const match = expiresIn.match(/^(\d+)([dhms])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            switch (unit) {
                case "d":
                    expiryTime.setDate(expiryTime.getDate() + value);
                    break;
                case "h":
                    expiryTime.setHours(expiryTime.getHours() + value);
                    break;
                case "m":
                    expiryTime.setMinutes(expiryTime.getMinutes() + value);
                    break;
                case "s":
                    expiryTime.setSeconds(expiryTime.getSeconds() + value);
                    break;
                default:
                    expiryTime.setHours(expiryTime.getHours() + 24);
            }
        }
        else {
            expiryTime.setHours(expiryTime.getHours() + 24);
        }
        return expiryTime;
    }
    async checkEmailExists(email) {
        try {
            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase().trim() },
            });
            return {
                exists: !!user,
                user: user || undefined,
            };
        }
        catch (error) {
            console.error("Error checking email existence:", error);
            return {
                exists: false,
                user: undefined,
            };
        }
    }
    async signIn(email, password, req, res) {
        try {
            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase().trim() },
                relations: ["role", "role.permissions"],
            });
            if (!user) {
                await bcryptjs_1.default.hash("dummy", 12);
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }
            if (!user?.isActive) {
                return {
                    success: false,
                    message: "Account is deactivated",
                };
            }
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
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                console.log("Password verification failed for user:", email);
                await this.incrementFailedLoginAttempts(user);
                const maxAttempts = 5;
                const remainingAttempts = maxAttempts - user.failedLoginAttempts;
                if (user.failedLoginAttempts >= maxAttempts) {
                    return {
                        success: false,
                        message: "Account locked due to too many failed attempts. Try again in 30 minutes.",
                        accountLocked: true,
                        lockoutTime: user.accountLockedUntil,
                        remainingAttempts: 0,
                    };
                }
                else {
                    return {
                        success: false,
                        message: "Invalid email or password",
                        remainingAttempts,
                    };
                }
            }
            await this.resetFailedLoginAttempts(user);
            const accessToken = this.generateToken(user);
            const expiresAt = this.getTokenExpiryTime();
            const { sessionId, refreshToken } = await this.createSession(user, req);
            if (res) {
                const { CookieService } = await Promise.resolve().then(() => __importStar(require("./cookie.service")));
                const cookieService = new CookieService();
                cookieService.setAccessTokenCookie(res, accessToken);
                cookieService.setRefreshTokenCookie(res, refreshToken);
                cookieService.setSessionCookie(res, sessionId);
            }
            else {
                console.log("⚠️ No response object provided - cookies NOT set");
            }
            user.lastLogin = new Date();
            await this.userRepository.save(user);
            const notificationRepository = typeorm_1.AppDataSource.getRepository(models_1.Notification);
            const unreadNotifications = await notificationRepository.count({
                where: {
                    recipientUserId: user.userId,
                    isRead: false,
                },
            });
            const { Employee } = await Promise.resolve().then(() => __importStar(require("../models/entities/employee")));
            const employeeRepository = typeorm_1.AppDataSource.getRepository(Employee);
            const employee = await employeeRepository.findOne({
                where: { userId: user.userId },
                select: ["employeeId"],
            });
            const userData = {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                employeeId: employee?.employeeId,
                role: (0, formatters_1.formatRole)(user.role),
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
        }
        catch (error) {
            console.error("SignIn error:", error);
            return {
                success: false,
                message: "An error occurred during sign in",
            };
        }
    }
    generateToken(user) {
        const payload = {
            userId: user.userId,
            email: user.email,
            roleId: user.roleId,
            role: user.role,
        };
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        });
    }
    async incrementFailedLoginAttempts(user) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 5) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + 2);
            user.accountLockedUntil = lockUntil;
        }
        await this.userRepository.save(user);
    }
    async resetFailedLoginAttempts(user) {
        if (user.failedLoginAttempts > 0 || user.accountLockedUntil) {
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = undefined;
            await this.userRepository.save(user);
        }
    }
    async hashPassword(password) {
        const saltRounds = 12;
        return await bcryptjs_1.default.hash(password, saltRounds);
    }
    async setNewPassword(email, newPassword, confirmPassword, req, res) {
        try {
            const errors = [];
            if (confirmPassword && newPassword !== confirmPassword) {
                errors.push("Passwords do not match");
            }
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
            console.log("Looking up user with email/userId:", email);
            let user = await this.userRepository.findOne({
                where: [{ email: email.toLowerCase().trim() }],
                relations: ["role", "role.permissions"],
            });
            if (!user && email.length === 36) {
                console.log("Trying to find user by UUID:", email);
                user = await this.userRepository.findOne({
                    where: [{ userId: email }],
                    relations: ["role", "role.permissions"],
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
            if (!user.isActive) {
                return {
                    success: false,
                    message: "Account is deactivated",
                };
            }
            const hashedPassword = await this.hashPassword(newPassword);
            user.passwordHash = hashedPassword;
            user.passwordChangedAt = new Date();
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = undefined;
            console.log("Saving user with userId:", user.userId);
            const savedUser = await this.userRepository.save(user);
            console.log("User saved. SavedUser details:", {
                userId: savedUser.userId,
                email: savedUser.email,
                hasUserId: !!savedUser.userId,
                userIdType: typeof savedUser.userId,
                userIdValue: savedUser.userId,
            });
            if (savedUser.userId) {
                try {
                    console.log("Creating notification for user:", {
                        userId: savedUser.userId,
                        email: savedUser.email,
                    });
                    const notificationRepository = typeorm_1.AppDataSource.getRepository(models_1.Notification);
                    const queryRunner = typeorm_1.AppDataSource.createQueryRunner();
                    await queryRunner.connect();
                    await queryRunner.startTransaction();
                    try {
                        const result = await queryRunner.query(`INSERT INTO notifications (title, message, type, "isRead", "recipientUserId", "createdAt") 
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING "notificationId"`, [
                            "Password Changed",
                            "Your password has been successfully updated",
                            "success",
                            false,
                            savedUser.userId,
                            new Date(),
                        ]);
                        await queryRunner.commitTransaction();
                        console.log("Password change notification created successfully via raw query:", result);
                    }
                    catch (queryError) {
                        await queryRunner.rollbackTransaction();
                        throw queryError;
                    }
                    finally {
                        await queryRunner.release();
                    }
                }
                catch (notificationError) {
                    console.error("Failed to create password change notification:", notificationError);
                }
            }
            else {
                console.warn("Skipping notification creation - savedUser.userId is null");
            }
            const accessToken = this.generateToken(savedUser);
            const expiresAt = this.getTokenExpiryTime();
            const { sessionId, refreshToken } = await this.createSession(savedUser, req);
            if (res) {
                const { CookieService } = await Promise.resolve().then(() => __importStar(require("./cookie.service")));
                const cookieService = new CookieService();
                cookieService.setAccessTokenCookie(res, accessToken);
                cookieService.setRefreshTokenCookie(res, refreshToken);
                cookieService.setSessionCookie(res, sessionId);
            }
            savedUser.lastLogin = new Date();
            await this.userRepository.save(savedUser);
            const notificationRepository = typeorm_1.AppDataSource.getRepository(models_1.Notification);
            const unreadNotifications = await notificationRepository.count({
                where: {
                    recipientUserId: savedUser.userId,
                    isRead: false,
                },
            });
            const { Employee } = await Promise.resolve().then(() => __importStar(require("../models/entities/employee")));
            const employeeRepository = typeorm_1.AppDataSource.getRepository(Employee);
            const employee = await employeeRepository.findOne({
                where: { userId: savedUser.userId },
                select: ["employeeId"],
            });
            const userData = {
                userId: savedUser.userId,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                employeeId: employee?.employeeId,
                role: (0, formatters_1.formatRole)(savedUser.role),
                isEmailVerified: savedUser.isEmailVerified,
                lastLogin: savedUser.lastLogin,
                createdAt: savedUser.createdAt,
                unreadNotifications: unreadNotifications,
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
        }
        catch (error) {
            console.error("Set new password error:", error);
            return {
                success: false,
                message: "An error occurred while setting new password",
            };
        }
    }
    validatePasswordStrength(password) {
        const errors = [];
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
    generateRefreshToken(user, sessionId) {
        const payload = {
            userId: user.userId,
            sessionId: sessionId,
            type: "refresh",
            jti: (0, uuid_1.v4)(),
        };
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        });
    }
    async createSession(user, req) {
        const sessionId = (0, uuid_1.v4)();
        const refreshToken = this.generateRefreshToken(user, sessionId);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const session = new session_1.Session();
        session.sessionId = sessionId;
        session.userId = user.userId;
        session.sessionToken = sessionId;
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
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);
            if (decoded.type !== "refresh") {
                return { success: false, error: "Invalid token type" };
            }
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
            session.lastActivity = new Date();
            await this.sessionRepository.save(session);
            const { Employee } = await Promise.resolve().then(() => __importStar(require("../models/entities/employee")));
            const employeeRepository = typeorm_1.AppDataSource.getRepository(Employee);
            const employee = await employeeRepository.findOne({
                where: { userId: session.user.userId },
                select: ["employeeId"],
            });
            const userWithEmployee = {
                ...session.user,
                employeeId: employee?.employeeId,
            };
            const accessToken = this.generateToken(session.user);
            const expiresAt = this.getTokenExpiryTime();
            return {
                success: true,
                accessToken,
                expiresAt,
                user: userWithEmployee,
            };
        }
        catch (error) {
            console.error("Refresh token error:", error);
            return { success: false, error: "Invalid refresh token" };
        }
    }
    async logout(sessionId, refreshToken) {
        try {
            if (sessionId) {
                await this.sessionRepository.update({ sessionId }, { isActive: false });
            }
            else if (refreshToken) {
                const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);
                await this.sessionRepository.update({ sessionId: decoded.sessionId }, { isActive: false });
            }
            return { success: true, message: "Logged out successfully" };
        }
        catch (error) {
            console.error("Logout error:", error);
            return { success: false, message: "Logout failed" };
        }
    }
    async logoutFromAllDevices(userId) {
        try {
            await this.sessionRepository.update({ userId, isActive: true }, { isActive: false });
            return { success: true, message: "Logged out from all devices" };
        }
        catch (error) {
            console.error("Logout all error:", error);
            return { success: false, message: "Logout failed" };
        }
    }
    async getActiveSessions(userId) {
        return await this.sessionRepository.find({
            where: {
                userId,
                isActive: true,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
            order: { lastActivity: "DESC" },
        });
    }
    async cleanupExpiredSessions() {
        const result = await this.sessionRepository.update({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
            isActive: true,
        }, { isActive: false });
        return result.affected || 0;
    }
}
exports.AuthService = AuthService;
class EmailService {
    constructor() {
        this.userRepository = typeorm_1.AppDataSource.getRepository(user_1.User);
        this.verificationRepository = typeorm_1.AppDataSource.getRepository(email_verification_code_1.EmailVerification);
        this.notificationRepository = typeorm_1.AppDataSource.getRepository(models_1.Notification);
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    async sendVerificationEmail(email, req) {
        try {
            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase().trim() },
            });
            if (!user) {
                return { success: false, message: "Email not found in our system" };
            }
            const existingVerification = await this.verificationRepository.findOne({
                where: {
                    userId: user.userId,
                    email: email.toLowerCase().trim(),
                    verificationType: email_verification_code_1.VerificationType.EMAIL_VERIFICATION,
                    isUsed: false,
                },
                order: { createdAt: "DESC" },
            });
            if (existingVerification && !existingVerification.canAttempt()) {
                return {
                    success: false,
                    message: "Too many verification attempts. Please try again later.",
                };
            }
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
            const verification = new email_verification_code_1.EmailVerification();
            verification.userId = user.userId;
            verification.email = email.toLowerCase().trim();
            verification.code = verifyCode;
            verification.verificationType = email_verification_code_1.VerificationType.EMAIL_VERIFICATION;
            verification.expiresAt = expiryTime;
            verification.ipAddress = req?.ip || null;
            verification.userAgent = req?.get("User-Agent") || null;
            await this.verificationRepository.save(verification);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Email Verification - ERP System",
                html: this.getVerificationEmailTemplate(user.firstName, verifyCode, 10),
            };
            const result = await this.transporter.sendMail(mailOptions);
            console.log("Verification email sent:", result.messageId);
            await this.createNotification(user.userId, "Email Verification Code Sent", `A verification code has been sent to ${email}`, models_1.NotificationType.INFO);
            return {
                success: true,
                message: "Verification code sent successfully",
                expiresIn: 10,
            };
        }
        catch (error) {
            console.error("Email sending failed:", error);
            return { success: false, message: "Failed to send verification email" };
        }
    }
    async verifyEmailCode(email, code, req) {
        try {
            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase().trim() },
            });
            if (!user) {
                return { success: false, message: "Email not found" };
            }
            const verification = await this.verificationRepository.findOne({
                where: {
                    userId: user.userId,
                    email: email.toLowerCase().trim(),
                    verificationType: email_verification_code_1.VerificationType.EMAIL_VERIFICATION,
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
            if (!verification.canAttempt()) {
                return {
                    success: false,
                    message: "Too many failed attempts. Please request a new verification code.",
                };
            }
            verification.incrementAttempt();
            if (verification.isExpired()) {
                await this.verificationRepository.save(verification);
                return {
                    success: false,
                    message: "Verification code has expired. Please request a new one.",
                };
            }
            if (verification.code !== code) {
                await this.verificationRepository.save(verification);
                const remainingAttempts = 5 - verification.attemptCount;
                return {
                    success: false,
                    message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
                };
            }
            verification.markAsUsed();
            await this.verificationRepository.save(verification);
            user.isEmailVerified = true;
            await this.userRepository.save(user);
            await this.createNotification(user.userId, "Email Verified Successfully", "Your email address has been verified successfully.", models_1.NotificationType.SUCCESS);
            return {
                success: true,
                message: "Email verified successfully",
                user: user,
            };
        }
        catch (error) {
            console.error("Email verification failed:", error);
            return { success: false, message: "Verification failed" };
        }
    }
    getVerificationEmailTemplate(firstName, code, expiryMinutes) {
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
    async createNotification(userId, title, message, type) {
        try {
            const notification = new models_1.Notification();
            notification.recipientUserId = userId;
            notification.title = title;
            notification.message = message;
            notification.type = type;
            await this.notificationRepository.save(notification);
        }
        catch (error) {
            console.error("Failed to create notification:", error);
        }
    }
    async getVerificationHistory(userId) {
        return await this.verificationRepository.find({
            where: { userId },
            order: { createdAt: "DESC" },
            take: 10,
        });
    }
    async cleanupExpiredVerifications() {
        const result = await this.verificationRepository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
            isUsed: false,
        });
        return result.affected || 0;
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=auth.service.js.map