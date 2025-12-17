import { Response } from "express";
export interface CookieOptions {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
    domain?: string;
}
export declare class CookieService {
    private readonly isProd;
    private readonly domain;
    private readonly secure;
    private getRefreshTokenCookieOptions;
    private getAccessTokenCookieOptions;
    private getSessionCookieOptions;
    setAccessTokenCookie(res: Response, accessToken: string): void;
    setRefreshTokenCookie(res: Response, refreshToken: string): void;
    setSessionCookie(res: Response, sessionId: string): void;
    setUserPreferencesCookie(res: Response, preferences: any): void;
    clearAccessTokenCookie(res: Response): void;
    clearRefreshTokenCookie(res: Response): void;
    clearSessionCookie(res: Response): void;
    clearAllAuthCookies(res: Response): void;
    getAccessTokenFromCookies(req: any): string | null;
    getRefreshTokenFromCookies(req: any): string | null;
    getSessionIdFromCookies(req: any): string | null;
    hasAuthCookies(req: any): boolean;
    getCookieConfig(): {
        domain: string;
        secure: boolean;
        sameSite: string;
        httpOnly: boolean;
        path: string;
    };
}
//# sourceMappingURL=cookie.service.d.ts.map