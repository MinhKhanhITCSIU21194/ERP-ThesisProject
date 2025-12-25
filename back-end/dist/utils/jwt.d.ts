export interface JWTPayload {
    userId: string;
    username?: string;
    email: string;
    role?: any;
    sessionId?: string;
}
export declare const verifyToken: (token: string) => Promise<JWTPayload>;
export declare const signToken: (payload: JWTPayload, expiresIn?: string) => string;
//# sourceMappingURL=jwt.d.ts.map