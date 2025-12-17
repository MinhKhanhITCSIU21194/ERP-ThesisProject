"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setNewPassword = exports.validateSession = exports.verifyEmailCode = exports.emailVerification = exports.signIn = exports.checkEmailExist = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
const emailService = new auth_service_1.EmailService();
const checkEmailExist = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error checking email:", error);
        return res.status(500).json({
            error: "Internal server error",
            exists: false,
        });
    }
};
exports.checkEmailExist = checkEmailExist;
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const result = await authService.signIn(email, password, req, res);
        if (!result.success) {
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
        return res.json({
            success: true,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            sessionId: result.sessionId,
            tokenType: "Bearer",
            expiresIn: result.expiresIn || "30m",
            expiresAt: result.expiresAt?.toISOString(),
            user: {
                id: result.user.userId,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                fullName: `${result.user.firstName} ${result.user.lastName}`,
                employeeID: result.user.employeeId,
                role: result.user.role,
                isActive: result.user.isActive,
                isEmailVerified: result.user.isEmailVerified,
                lastLogin: result.user.lastLogin,
                unreadNotifications: result.user.unreadNotifications || 0,
            },
            loginTime: new Date().toISOString(),
            message: result.message || "Sign in successful",
        });
    }
    catch (error) {
        console.error("SignIn controller error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};
exports.signIn = signIn;
const emailVerification = async (req, res) => {
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
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }
    }
    catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.emailVerification = emailVerification;
const verifyEmailCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required",
            });
        }
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
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }
    }
    catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.verifyEmailCode = verifyEmailCode;
const validateSession = async (req, res) => {
    try {
        const { CookieService } = await Promise.resolve().then(() => __importStar(require("../services/cookie.service")));
        const cookieService = new CookieService();
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
        const result = await authService.refreshAccessToken(refreshToken);
        if (!result.success) {
            cookieService.clearAllAuthCookies(res);
            return res.status(401).json({
                success: false,
                message: "Session expired",
            });
        }
        if (result.accessToken) {
            cookieService.setAccessTokenCookie(res, result.accessToken);
            cookieService.setSessionCookie(res, sessionId);
        }
        return res.json({
            success: true,
            accessToken: result.accessToken,
            refreshToken: refreshToken,
            sessionId: sessionId,
            tokenType: "Bearer",
            expiresIn: "30m",
            expiresAt: result.expiresAt?.toISOString(),
            user: {
                userId: result.user.userId,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                fullName: `${result.user.firstName} ${result.user.lastName}`,
                employeeID: result.user.employeeId,
                role: result.user.role,
                isEmailVerified: result.user.isEmailVerified,
                lastLogin: result.user.lastLogin,
                createdAt: result.user.createdAt,
            },
            message: "Session is valid",
        });
    }
    catch (error) {
        console.error("Session validation error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during session validation",
        });
    }
};
exports.validateSession = validateSession;
const setNewPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword, uuID } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "User identifier and new password are required",
                errors: [],
            });
        }
        const result = await authService.setNewPassword(email, newPassword, confirmPassword, req, res);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
                errors: result.errors || [],
            });
        }
        return res.json({
            success: true,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            sessionId: result.sessionId,
            tokenType: "Bearer",
            expiresIn: result.expiresIn,
            expiresAt: result.expiresAt?.toISOString(),
            user: {
                id: result.user.userId,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                fullName: `${result.user.firstName} ${result.user.lastName}`,
                employeeID: result.user.employeeId,
                role: result.user.role,
                isActive: result.user.isActive,
                isEmailVerified: result.user.isEmailVerified,
                lastLogin: result.user.lastLogin,
                unreadNotifications: result.user.unreadNotifications || 0,
            },
            loginTime: new Date().toISOString(),
            message: result.message || "Password updated and user signed in successfully",
        });
    }
    catch (error) {
        console.error("Set new password controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: [],
        });
    }
};
exports.setNewPassword = setNewPassword;
//# sourceMappingURL=auth.controller.js.map