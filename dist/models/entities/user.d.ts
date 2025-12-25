export declare class User {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    isActive: boolean;
    employeeId?: string;
    roleId: number;
    lastLogin?: Date;
    failedLoginAttempts: number;
    isEmailVerified: boolean;
    accountLockedUntil?: Date;
    passwordChangedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    role: any;
    sessions: any[];
    receivedNotifications: any[];
    sentNotifications: any[];
    isAccountLocked(): boolean;
    shouldForcePasswordChange(): boolean;
}
//# sourceMappingURL=user.d.ts.map