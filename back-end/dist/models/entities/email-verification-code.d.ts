import { User } from "./user";
export declare enum VerificationType {
    EMAIL_VERIFICATION = "email_verification",
    PASSWORD_RESET = "password_reset",
    TWO_FACTOR = "two_factor"
}
export declare class EmailVerification {
    id: number;
    userId: string;
    code: string;
    email: string;
    verificationType: VerificationType;
    expiresAt: Date;
    isUsed: boolean;
    attemptCount: number;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    usedAt?: Date;
    user: User;
    isValid(): boolean;
    isExpired(): boolean;
    canAttempt(): boolean;
    incrementAttempt(): void;
    markAsUsed(): void;
    getExpiryMinutes(): number;
    getDisplayType(): string;
}
//# sourceMappingURL=email-verification-code.d.ts.map