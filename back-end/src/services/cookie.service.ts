import { Response } from "express";
import dotenv from "dotenv";

dotenv.config();

export interface CookieOptions {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  domain?: string;
}

export class CookieService {
  private readonly isProd = process.env.NODE_ENV === "production";
  private readonly domain = process.env.COOKIE_DOMAIN || "localhost";
  private readonly secure = process.env.COOKIE_SECURE === "true" || this.isProd;

  // Default cookie options for refresh tokens
  private getRefreshTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.secure,
      sameSite: this.isProd ? "strict" : "lax", // 'lax' for dev (cross-origin), 'strict' for prod
      path: "/", // Changed from "/api/auth" to "/" so it's sent with all requests
      domain: this.isProd ? this.domain : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  // Default cookie options for access tokens
  private getAccessTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.secure,
      sameSite: this.isProd ? "strict" : "lax", // 'lax' for dev (cross-origin), 'strict' for prod
      path: "/",
      domain: this.isProd ? this.domain : undefined,
      maxAge: 30 * 60 * 1000, // 30 minutes
    };
  }

  // Default cookie options for session tracking
  private getSessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.secure,
      sameSite: this.isProd ? "strict" : "lax", // 'lax' for dev (cross-origin), 'strict' for prod
      path: "/",
      domain: this.isProd ? this.domain : undefined,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };
  }

  // Set access token cookie
  setAccessTokenCookie(res: Response, accessToken: string): void {
    const options = this.getAccessTokenCookieOptions();
    res.cookie("access_token", accessToken, options);
  }

  // Set refresh token cookie
  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    const options = this.getRefreshTokenCookieOptions();
    res.cookie("refresh_token", refreshToken, options);
  }

  // Set session ID cookie (for session tracking)
  setSessionCookie(res: Response, sessionId: string): void {
    const options = this.getSessionCookieOptions();
    res.cookie("session_id", sessionId, options);
  }

  // Set user preferences cookie (non-sensitive data)
  setUserPreferencesCookie(res: Response, preferences: any): void {
    const options: CookieOptions = {
      httpOnly: false, // Allow frontend access for UI preferences
      secure: this.secure,
      sameSite: this.isProd ? "strict" : "lax", // 'lax' for dev (cross-origin), 'strict' for prod
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    res.cookie("user_prefs", JSON.stringify(preferences), options);
  }

  // Clear access token cookie
  clearAccessTokenCookie(res: Response): void {
    res.clearCookie("access_token", {
      path: "/",
      domain: this.isProd ? this.domain : undefined,
    });
  }

  // Clear refresh token cookie
  clearRefreshTokenCookie(res: Response): void {
    res.clearCookie("refresh_token", {
      path: "/", // Must match the path used when setting the cookie
      domain: this.isProd ? this.domain : undefined,
    });
  }

  // Clear session cookie
  clearSessionCookie(res: Response): void {
    res.clearCookie("session_id", {
      path: "/",
      domain: this.isProd ? this.domain : undefined,
    });
  }

  // Clear all auth cookies
  clearAllAuthCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
    this.clearSessionCookie(res);
    res.clearCookie("user_prefs");
  }

  // Extract access token from cookies
  getAccessTokenFromCookies(req: any): string | null {
    return req.cookies?.access_token || null;
  }

  // Extract refresh token from cookies
  getRefreshTokenFromCookies(req: any): string | null {
    return req.cookies?.refresh_token || null;
  }

  // Extract session ID from cookies
  getSessionIdFromCookies(req: any): string | null {
    return req.cookies?.session_id || null;
  }

  // Security check for cookie presence
  hasAuthCookies(req: any): boolean {
    return !!(
      req.cookies?.access_token ||
      req.cookies?.refresh_token ||
      req.cookies?.session_id
    );
  }

  // Get cookie configuration for frontend
  getCookieConfig() {
    return {
      domain: this.domain,
      secure: this.secure,
      sameSite: this.isProd ? "strict" : "lax",
      httpOnly: true,
      path: "/",
    };
  }
}
