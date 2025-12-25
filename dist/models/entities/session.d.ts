export declare class Session {
    sessionId: string;
    userId: string;
    sessionToken: string;
    refreshToken?: string;
    ipAddress?: string;
    userAgent?: string;
    isActive: boolean;
    expiresAt: Date;
    lastActivity: Date;
    createdAt: Date;
    user: any;
    isExpired(): boolean;
    isValid(): boolean;
    updateActivity(): void;
}
//# sourceMappingURL=session.d.ts.map