/**
 * TokenService - Manages authentication preferences
 *
 * Strategy: Pure httpOnly cookie-based authentication
 * - All tokens stored in httpOnly cookies (managed by server, secure against XSS)
 * - No localStorage token storage (prevents XSS attacks)
 * - Remember Me: localStorage preference only
 */
class TokenService {
  private static REMEMBER_ME_KEY = "rememberMe";

  /**
   * Check if "Remember Me" is enabled
   */
  static getRememberMe(): boolean {
    return localStorage.getItem(this.REMEMBER_ME_KEY) === "true";
  }

  /**
   * Set "Remember Me" preference
   */
  static setRememberMe(remember: boolean): void {
    localStorage.setItem(this.REMEMBER_ME_KEY, remember.toString());
  }

  /**
   * Clear all authentication data
   */
  static clearSession(): void {
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    localStorage.removeItem("user");
  }

  /**
   * Check if user is authenticated by checking for httpOnly cookies
   * Note: This is a basic check - actual validation happens on server
   */
  static isAuthenticated(): boolean {
    // Check if access_token or refresh_token cookies exist
    const hasCookies =
      document.cookie.includes("access_token") ||
      document.cookie.includes("refresh_token");

    return hasCookies;
  }
}

export default TokenService;
