import { AuthService } from "../services/auth.service";

export class SessionCleanupService {
  private authService: AuthService;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.authService = new AuthService();
  }

  // Start the cleanup service (runs every hour)
  start(): void {
    if (this.intervalId) {
      console.warn("Session cleanup service is already running");
      return;
    }

    console.log("🧹 Starting session cleanup service...");

    // Run immediately on start
    this.cleanup();

    // Then run every hour (3600000 ms = 1 hour)
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, 3600000);
  }

  // Stop the cleanup service
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 Session cleanup service stopped");
    }
  }

  // Perform the cleanup
  private async cleanup(): Promise<void> {
    try {
      const cleanedCount = await this.authService.cleanupExpiredSessions();

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
      }
    } catch (error) {
      console.error("❌ Error during session cleanup:", error);
    }
  }

  // Manual cleanup trigger
  async manualCleanup(): Promise<number> {
    try {
      const cleanedCount = await this.authService.cleanupExpiredSessions();
      console.log(
        `🧹 Manual cleanup: ${cleanedCount} expired sessions removed`
      );
      return cleanedCount;
    } catch (error) {
      console.error("❌ Error during manual cleanup:", error);
      return 0;
    }
  }
}

// Singleton instance
export const sessionCleanupService = new SessionCleanupService();
