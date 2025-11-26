import { Request, Response } from "express";
import { AuthService, EmailService } from "../services/auth.service";

const authService = new AuthService();
const emailService = new EmailService();

export const checkEmailExist = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        exists: false,
      });
    }

    const { exists, user } = await authService.checkEmailExists(email);

    if (!exists) {
      return res.status(400).json({
        message: "Email does not exist",
        exists: false,
      });
    }

    return res.json({
      name: user ? `${user.firstName} ${user.lastName}` : null,
      exists: true,
    });
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({
      error: "Internal server error",
      exists: false,
    });
  }
};
export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Call auth service with request and response for cookie support
    const result = await authService.signIn(email, password, req, res);

    if (!result.success) {
      // Handle specific error cases
      if (result.accountLocked) {
        return res.status(423).json({
          success: false,
          message: result.message,
          accountLocked: true,
          lockoutTime: result.lockoutTime,
          remainingAttempts: result.remainingAttempts,
        });
      }

      if (result.emailVerificationRequired) {
        return res.status(403).json({
          success: false,
          message: result.message,
          emailVerificationRequired: true,
        });
      }

      return res.status(401).json({
        success: false,
        message: result.message,
        remainingAttempts: result.remainingAttempts,
      });
    }

    // Return successful response with both token and cookie support
    return res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // Only sent if cookies are disabled
      sessionId: result.sessionId,
      tokenType: "Bearer",
      expiresIn: result.expiresIn || "30m",
      expiresAt: result.expiresAt?.toISOString(),
      user: {
        id: result.user!.userId,
        email: result.user!.email,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        fullName: `${result.user!.firstName} ${result.user!.lastName}`,
        employeeID: result.user!.employeeId,
        role: result.user!.role, // Now contains the full role object with permissions
        isActive: result.user!.isActive,
        isEmailVerified: result.user!.isEmailVerified,
        lastLogin: result.user!.lastLogin,
        unreadNotifications: result.user!.unreadNotifications || 0,
      },
      loginTime: new Date().toISOString(),
      message: result.message || "Sign in successful",
    });
  } catch (error) {
    console.error("SignIn controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const emailVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await emailService.sendVerificationEmail(email, req);

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        expiresIn: result.expiresIn,
        email: email,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code format. Code must be 6 digits.",
      });
    }

    const result = await emailService.verifyEmailCode(email, code, req);

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        user: result.user
          ? {
              id: result.user.userId,
              email: result.user.email,
              firstName: result.user.firstName,
              lastName: result.user.lastName,
              isEmailVerified: result.user.isEmailVerified,
            }
          : undefined,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const validateSession = async (req: Request, res: Response) => {
  try {
    const { CookieService } = await import("../services/cookie.service");
    const cookieService = new CookieService();

    // Get refresh token and session ID from cookies
    const refreshToken = cookieService.getRefreshTokenFromCookies(req);
    const sessionId = cookieService.getSessionIdFromCookies(req);

    console.log("Session validation - cookies found:", {
      hasRefreshToken: !!refreshToken,
      hasSessionId: !!sessionId,
    });

    if (!refreshToken || !sessionId) {
      return res.status(401).json({
        success: false,
        message: "No valid session found",
      });
    }

    // Validate the refresh token and get user info
    const result = await authService.refreshAccessToken(refreshToken);

    if (!result.success) {
      // Clear invalid cookies
      cookieService.clearAllAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    // Set new access token cookie
    if (result.accessToken) {
      cookieService.setAccessTokenCookie(res, result.accessToken);
      cookieService.setSessionCookie(res, sessionId);
    }

    // Return user information with tokens
    return res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: refreshToken, // Return the same refresh token
      sessionId: sessionId,
      tokenType: "Bearer",
      expiresIn: "30m",
      expiresAt: result.expiresAt?.toISOString(),
      user: {
        userId: result.user!.userId,
        email: result.user!.email,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        fullName: `${result.user!.firstName} ${result.user!.lastName}`,
        employeeID: result.user!.employeeId,
        role: result.user!.role,
        isEmailVerified: result.user!.isEmailVerified,
        lastLogin: result.user!.lastLogin,
        createdAt: result.user!.createdAt,
      },
      message: "Session is valid",
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during session validation",
    });
  }
};

export const setNewPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmPassword, uuID } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User identifier and new password are required",
        errors: [],
      });
    }

    // Call auth service to set new password and sign user in
    const result = await authService.setNewPassword(
      email,
      newPassword,
      confirmPassword,
      req,
      res
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors || [],
      });
    }

    // Return successful response with authentication data
    return res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      sessionId: result.sessionId,
      tokenType: "Bearer",
      expiresIn: result.expiresIn,
      expiresAt: result.expiresAt?.toISOString(),
      user: {
        id: result.user!.userId,
        email: result.user!.email,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        fullName: `${result.user!.firstName} ${result.user!.lastName}`,
        employeeID: result.user!.employeeId,
        role: result.user!.role, // Now contains the full role object with permissions
        isActive: result.user!.isActive,
        isEmailVerified: result.user!.isEmailVerified,
        lastLogin: result.user!.lastLogin,
        unreadNotifications: result.user!.unreadNotifications || 0,
      },
      loginTime: new Date().toISOString(),
      message:
        result.message || "Password updated and user signed in successfully",
    });
  } catch (error) {
    console.error("Set new password controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};
