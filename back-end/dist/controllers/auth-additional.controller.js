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
exports.getActiveSessions = exports.logoutFromAllDevices = exports.logout = exports.refreshToken = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
const refreshToken = async (req, res) => {
    try {
        const { CookieService } = await Promise.resolve().then(() => __importStar(require("../services/cookie.service")));
        const cookieService = new CookieService();
        const refreshToken = cookieService.getRefreshTokenFromCookies(req) || req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }
        const result = await authService.refreshAccessToken(refreshToken);
        if (!result.success) {
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
                id: result.user.userId,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                role: result.user.role,
            },
            message: "Token refreshed successfully",
        });
    }
    catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const { CookieService } = await Promise.resolve().then(() => __importStar(require("../services/cookie.service")));
        const cookieService = new CookieService();
        const sessionId = cookieService.getSessionIdFromCookies(req) || req.body.sessionId;
        const refreshToken = cookieService.getRefreshTokenFromCookies(req) || req.body.refreshToken;
        const result = await authService.logout(sessionId, refreshToken);
        cookieService.clearAllAuthCookies(res);
        return res.json({
            success: true,
            message: result.message || "Logged out successfully",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        const { CookieService } = await Promise.resolve().then(() => __importStar(require("../services/cookie.service")));
        const cookieService = new CookieService();
        cookieService.clearAllAuthCookies(res);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.logout = logout;
const logoutFromAllDevices = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const result = await authService.logoutFromAllDevices(userId);
        const { CookieService } = await Promise.resolve().then(() => __importStar(require("../services/cookie.service")));
        const cookieService = new CookieService();
        cookieService.clearAllAuthCookies(res);
        return res.json({
            success: true,
            message: result.message || "Logged out from all devices successfully",
        });
    }
    catch (error) {
        console.error("Logout from all devices error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.logoutFromAllDevices = logoutFromAllDevices;
const getActiveSessions = async (req, res) => {
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
    }
    catch (error) {
        console.error("Get active sessions error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getActiveSessions = getActiveSessions;
//# sourceMappingURL=auth-additional.controller.js.map