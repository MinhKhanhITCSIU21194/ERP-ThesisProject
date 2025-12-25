import { User } from "../models/entities/user";
import { Session } from "../models/entities/session";
import { EmailVerification } from "../models/entities/email-verification-code";
export declare class AuthService {
    private userRepository;
    private sessionRepository;
    private readonly JWT_SECRET;
    private readonly JWT_EXPIRES_IN;
    private readonly REFRESH_TOKEN_SECRET;
    private readonly REFRESH_TOKEN_EXPIRES_IN;
    private getTokenExpiryTime;
    checkEmailExists(email: string): Promise<{
        exists: boolean;
        user?: User;
    }>;
    signIn(email: string, password: string, req?: any, res?: any): Promise<{
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
    }>;
    private generateToken;
    private incrementFailedLoginAttempts;
    private resetFailedLoginAttempts;
    hashPassword(password: string): Promise<string>;
    setNewPassword(email: string, newPassword: string, confirmPassword?: string, req?: any, res?: any): Promise<{
        success: boolean;
        user?: any;
        accessToken?: string;
        refreshToken?: string;
        sessionId?: string;
        expiresAt?: Date;
        expiresIn?: string;
        message?: string;
        errors?: string[];
    }>;
    private validatePasswordStrength;
    private generateRefreshToken;
    createSession(user: User, req: any): Promise<{
        sessionId: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        success: boolean;
        accessToken?: string;
        expiresAt?: Date;
        user?: User;
        error?: string;
    }>;
    logout(sessionId?: string, refreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    logoutFromAllDevices(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getActiveSessions(userId: string): Promise<Session[]>;
    cleanupExpiredSessions(): Promise<number>;
}
export declare class EmailService {
    private userRepository;
    private verificationRepository;
    private notificationRepository;
    private transporter;
    constructor();
    sendVerificationEmail(email: string, req?: any): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
    }>;
    verifyEmailCode(email: string, code: string, req?: any): Promise<{
        success: boolean;
        message: string;
        user?: User;
    }>;
    private getVerificationEmailTemplate;
    private createNotification;
    getVerificationHistory(userId: string): Promise<EmailVerification[]>;
    cleanupExpiredVerifications(): Promise<number>;
}
//# sourceMappingURL=auth.service.d.ts.map