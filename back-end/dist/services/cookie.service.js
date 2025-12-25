"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class CookieService {
    constructor() {
        this.isProd = process.env.NODE_ENV === "production";
        this.domain = process.env.COOKIE_DOMAIN || "localhost";
        this.secure = process.env.COOKIE_SECURE === "true" || this.isProd;
    }
    getRefreshTokenCookieOptions() {
        return {
            httpOnly: true,
            secure: this.secure,
            sameSite: this.isProd ? "strict" : "lax",
            path: "/",
            domain: this.isProd ? this.domain : undefined,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
    }
    getAccessTokenCookieOptions() {
        return {
            httpOnly: true,
            secure: this.secure,
            sameSite: this.isProd ? "strict" : "lax",
            path: "/",
            domain: this.isProd ? this.domain : undefined,
            maxAge: 30 * 60 * 1000,
        };
    }
    getSessionCookieOptions() {
        return {
            httpOnly: true,
            secure: this.secure,
            sameSite: this.isProd ? "strict" : "lax",
            path: "/",
            domain: this.isProd ? this.domain : undefined,
            maxAge: 24 * 60 * 60 * 1000,
        };
    }
    setAccessTokenCookie(res, accessToken) {
        const options = this.getAccessTokenCookieOptions();
        res.cookie("access_token", accessToken, options);
    }
    setRefreshTokenCookie(res, refreshToken) {
        const options = this.getRefreshTokenCookieOptions();
        res.cookie("refresh_token", refreshToken, options);
    }
    setSessionCookie(res, sessionId) {
        const options = this.getSessionCookieOptions();
        res.cookie("session_id", sessionId, options);
    }
    setUserPreferencesCookie(res, preferences) {
        const options = {
            httpOnly: false,
            secure: this.secure,
            sameSite: this.isProd ? "strict" : "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        };
        res.cookie("user_prefs", JSON.stringify(preferences), options);
    }
    clearAccessTokenCookie(res) {
        res.clearCookie("access_token", {
            path: "/",
            domain: this.isProd ? this.domain : undefined,
        });
    }
    clearRefreshTokenCookie(res) {
        res.clearCookie("refresh_token", {
            path: "/",
            domain: this.isProd ? this.domain : undefined,
        });
    }
    clearSessionCookie(res) {
        res.clearCookie("session_id", {
            path: "/",
            domain: this.isProd ? this.domain : undefined,
        });
    }
    clearAllAuthCookies(res) {
        this.clearAccessTokenCookie(res);
        this.clearRefreshTokenCookie(res);
        this.clearSessionCookie(res);
        res.clearCookie("user_prefs");
    }
    getAccessTokenFromCookies(req) {
        return req.cookies?.access_token || null;
    }
    getRefreshTokenFromCookies(req) {
        return req.cookies?.refresh_token || null;
    }
    getSessionIdFromCookies(req) {
        return req.cookies?.session_id || null;
    }
    hasAuthCookies(req) {
        return !!(req.cookies?.access_token ||
            req.cookies?.refresh_token ||
            req.cookies?.session_id);
    }
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
exports.CookieService = CookieService;
//# sourceMappingURL=cookie.service.js.map