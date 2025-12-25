"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionCleanupService = exports.SessionCleanupService = void 0;
const auth_service_1 = require("../services/auth.service");
class SessionCleanupService {
    constructor() {
        this.intervalId = null;
        this.authService = new auth_service_1.AuthService();
    }
    start() {
        if (this.intervalId) {
            console.warn("Session cleanup service is already running");
            return;
        }
        console.log("🧹 Starting session cleanup service...");
        this.cleanup();
        this.intervalId = setInterval(() => {
            this.cleanup();
        }, 3600000);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("🛑 Session cleanup service stopped");
        }
    }
    async cleanup() {
        try {
            const cleanedCount = await this.authService.cleanupExpiredSessions();
            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
            }
        }
        catch (error) {
            console.error("❌ Error during session cleanup:", error);
        }
    }
    async manualCleanup() {
        try {
            const cleanedCount = await this.authService.cleanupExpiredSessions();
            console.log(`🧹 Manual cleanup: ${cleanedCount} expired sessions removed`);
            return cleanedCount;
        }
        catch (error) {
            console.error("❌ Error during manual cleanup:", error);
            return 0;
        }
    }
}
exports.SessionCleanupService = SessionCleanupService;
exports.sessionCleanupService = new SessionCleanupService();
//# sourceMappingURL=session-cleanup.service.js.map