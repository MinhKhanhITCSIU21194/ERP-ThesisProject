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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jwt = require("jsonwebtoken");
dotenv_1.default.config();
const authenticateToken = async (req, res, next) => {
    try {
        const { CookieService } = await Promise.resolve().then(() => __importStar(require("../services/cookie.service")));
        const cookieService = new CookieService();
        let token = cookieService.getAccessTokenFromCookies(req);
        if (!token) {
            const authHeader = req.headers["authorization"];
            token = authHeader ? authHeader.split(" ")[1] || null : null;
        }
        if (!token) {
            const refreshToken = cookieService.getRefreshTokenFromCookies(req);
            const sessionId = cookieService.getSessionIdFromCookies(req);
            if (refreshToken && sessionId) {
                console.log("🔄 Calling authService.refreshAccessToken...");
                const { AuthService } = await Promise.resolve().then(() => __importStar(require("../services/auth.service")));
                const authService = new AuthService();
                const refreshResult = await authService.refreshAccessToken(refreshToken);
                if (refreshResult.success && refreshResult.accessToken) {
                    token = refreshResult.accessToken;
                    cookieService.setAccessTokenCookie(res, refreshResult.accessToken);
                    cookieService.setSessionCookie(res, sessionId);
                }
                else {
                    console.log("Auto-refresh failed:", refreshResult.error);
                }
            }
            else {
                console.log("Cannot auto-refresh: Missing refresh token or session ID");
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
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                try {
                    const refreshToken = cookieService.getRefreshTokenFromCookies(req);
                    const sessionId = cookieService.getSessionIdFromCookies(req);
                    if (refreshToken && sessionId) {
                        const { AuthService } = await Promise.resolve().then(() => __importStar(require("../services/auth.service")));
                        const authService = new AuthService();
                        const refreshResult = await authService.refreshAccessToken(refreshToken);
                        if (refreshResult.success && refreshResult.accessToken) {
                            cookieService.setAccessTokenCookie(res, refreshResult.accessToken);
                            cookieService.setSessionCookie(res, sessionId);
                            try {
                                const newDecoded = jwt.verify(refreshResult.accessToken, JWT_SECRET);
                                req.user = newDecoded;
                                return next();
                            }
                            catch (verifyNewErr) {
                                console.error("New token verification failed:", verifyNewErr);
                            }
                        }
                    }
                }
                catch (refreshErr) {
                    console.error("Token refresh attempt failed:", refreshErr);
                }
                cookieService.clearAllAuthCookies(res);
                return res.status(403).json({
                    success: false,
                    error: "Invalid or expired token",
                    message: "Please sign in again",
                });
            }
            req.user = decoded;
            next();
        });
    }
    catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({
            success: false,
            error: "Authentication error",
            message: "Internal server error during authentication",
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const { CookieService } = await Promise.resolve().then(() => __importStar(require("../services/cookie.service")));
        const cookieService = new CookieService();
        let token = cookieService.getAccessTokenFromCookies(req);
        if (!token) {
            const authHeader = req.headers["authorization"];
            token = authHeader ? authHeader.split(" ")[1] || null : null;
        }
        if (!token) {
            const refreshToken = cookieService.getRefreshTokenFromCookies(req);
            if (refreshToken) {
                const { AuthService } = await Promise.resolve().then(() => __importStar(require("../services/auth.service")));
                const authService = new AuthService();
                const refreshResult = await authService.refreshAccessToken(refreshToken);
                if (refreshResult.success && refreshResult.accessToken) {
                    token = refreshResult.accessToken;
                    cookieService.setAccessTokenCookie(res, refreshResult.accessToken);
                }
            }
        }
        if (token) {
            const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                req.user = decoded;
            }
            catch (err) {
                req.user = undefined;
            }
        }
        next();
    }
    catch (error) {
        console.error("Optional auth middleware error:", error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map