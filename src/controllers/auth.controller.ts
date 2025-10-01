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

    // Call auth service
    const result = await authService.signIn(email, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    // Return successful response
    return res.json({
      success: true,
      token: result.token,
      tokenType: "Bearer",
      expiresIn: result.expiresIn || "1d", // Token expiration time string
      expiresAt:
        result.expiresAt?.toISOString() ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Exact expiry timestamp
      user: {
        id: result.user!.userId,
        email: result.user!.email,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        fullName: `${result.user!.firstName} ${result.user!.lastName}`,
        username: result.user!.username,
        employeeId: result.user!.employeeId,
        role: {
          id: result.user!.roleId,
          name: result.user!.role?.name || "Unknown",
          permissions: result.user!.role?.permissions || {},
        },
        isActive: result.user!.isActive,
        lastLogin: result.user!.lastLogin,
        passwordChangedAt: result.user!.passwordChangedAt,
        shouldChangePassword: result.user!.shouldForcePasswordChange(),
      },
      loginTime: new Date().toISOString(),
      message: "Sign in successful",
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
