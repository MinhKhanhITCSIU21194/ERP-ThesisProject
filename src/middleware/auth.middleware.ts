import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { Role } from "../models";

const jwt = require("jsonwebtoken");
dotenv.config();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    username?: string;
    email: string;
    role: Role;
    sessionId?: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { CookieService } = await import("../services/cookie.service");
    const cookieService = new CookieService();

    // Debug: Log all cookies received
    console.log("🍪 Cookies received:", req.cookies);
    console.log("🔍 Request URL:", req.url);

    // Primary: Get token from httpOnly cookie (most secure)
    let token: string | null = cookieService.getAccessTokenFromCookies(req);
    console.log(
      "🔑 Access token from cookie:",
      token ? "✅ Found" : "❌ Not found"
    );

    // Fallback: Get token from Authorization header (for backwards compatibility)
    if (!token) {
      const authHeader = req.headers["authorization"];
      token = authHeader ? authHeader.split(" ")[1] || null : null; // Bearer TOKEN
      console.log(
        "🔑 Access token from header:",
        token ? "✅ Found" : "❌ Not found"
      );
    }

    // If no access token, try to refresh automatically using refresh token
    if (!token) {
      const refreshToken = cookieService.getRefreshTokenFromCookies(req);
      const sessionId = cookieService.getSessionIdFromCookies(req);
      console.log(
        "🔄 Attempting auto-refresh - Refresh token:",
        refreshToken ? "✅ Found" : "❌ Not found"
      );
      console.log(
        "🔄 Attempting auto-refresh - Session ID:",
        sessionId ? "✅ Found" : "❌ Not found"
      );

      if (refreshToken && sessionId) {
        // Attempt to refresh the access token automatically
        const { AuthService } = await import("../services/auth.service");
        const authService = new AuthService();

        const refreshResult = await authService.refreshAccessToken(
          refreshToken
        );

        if (refreshResult.success && refreshResult.accessToken) {
          token = refreshResult.accessToken;
          // Set new access token cookie
          cookieService.setAccessTokenCookie(res, refreshResult.accessToken);
          cookieService.setSessionCookie(res, sessionId);
        }
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
        message: "Please sign in to access this resource",
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

    (jwt as any).verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        // Clear cookies if token is invalid
        cookieService.clearAllAuthCookies(res);

        return res.status(403).json({
          success: false,
          error: "Invalid or expired token",
          message: "Please sign in again",
        });
      }

      req.user = decoded as {
        username: string;
        userId: string;
        email: string;
        role: Role;
        sessionId?: string;
      };

      next();
    });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication error",
      message: "Internal server error during authentication",
    });
  }
};

// Optional middleware for endpoints that work with or without authentication
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { CookieService } = await import("../services/cookie.service");
    const cookieService = new CookieService();

    // Primary: Get token from httpOnly cookie
    let token: string | null = cookieService.getAccessTokenFromCookies(req);

    // Fallback: Get token from Authorization header
    if (!token) {
      const authHeader = req.headers["authorization"];
      token = authHeader ? authHeader.split(" ")[1] || null : null;
    }

    // If no access token, try to refresh automatically
    if (!token) {
      const refreshToken = cookieService.getRefreshTokenFromCookies(req);

      if (refreshToken) {
        const { AuthService } = await import("../services/auth.service");
        const authService = new AuthService();
        const refreshResult = await authService.refreshAccessToken(
          refreshToken
        );

        if (refreshResult.success && refreshResult.accessToken) {
          token = refreshResult.accessToken;
          // Set new access token cookie
          cookieService.setAccessTokenCookie(res, refreshResult.accessToken);
        }
      }
    }

    if (token) {
      const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

      try {
        const decoded = (jwt as any).verify(token, JWT_SECRET);
        req.user = decoded as {
          userId: string;
          username?: string;
          email: string;
          role: Role;
          sessionId?: string;
        };
      } catch (err) {
        // Token invalid, but continue without user
        req.user = undefined;
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue without authentication
  }
};

export { AuthRequest };
