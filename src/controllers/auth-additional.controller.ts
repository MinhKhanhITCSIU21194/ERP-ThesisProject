import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Try to get refresh token from cookies first, then from body
    const { CookieService } = await import("../services/cookie.service");
    const cookieService = new CookieService();

    const refreshToken =
      cookieService.getRefreshTokenFromCookies(req) || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    if (!result.success) {
      // Clear cookies if refresh failed
      cookieService.clearAllAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: result.error || "Invalid refresh token",
      });
    }

    return res.json({
      success: true,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt?.toISOString(),
      expiresIn: "30m",
      user: {
        id: result.user!.userId,
        email: result.user!.email,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        role: result.user!.role,
      },
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { CookieService } = await import("../services/cookie.service");
    const cookieService = new CookieService();

    // Get session info from cookies or request
    const sessionId =
      cookieService.getSessionIdFromCookies(req) || req.body.sessionId;
    const refreshToken =
      cookieService.getRefreshTokenFromCookies(req) || req.body.refreshToken;

    // Logout from auth service
    const result = await authService.logout(sessionId, refreshToken);

    // Clear all auth cookies
    cookieService.clearAllAuthCookies(res);

    return res.json({
      success: true,
      message: result.message || "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear cookies even if logout fails
    const { CookieService } = await import("../services/cookie.service");
    const cookieService = new CookieService();
    cookieService.clearAllAuthCookies(res);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutFromAllDevices = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await authService.logoutFromAllDevices(userId);

    // Clear cookies for current session
    const { CookieService } = await import("../services/cookie.service");
    const cookieService = new CookieService();
    cookieService.clearAllAuthCookies(res);

    return res.json({
      success: true,
      message: result.message || "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout from all devices error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const sessions = await authService.getActiveSessions(userId);

    return res.json({
      success: true,
      sessions: sessions.map((session) => ({
        sessionId: session.sessionId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })),
      message: "Active sessions retrieved successfully",
    });
  } catch (error) {
    console.error("Get active sessions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
