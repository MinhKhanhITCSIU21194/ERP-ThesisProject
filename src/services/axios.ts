import axios, { AxiosRequestConfig } from "axios";
import TokenService from "./token.service";
import { BaseResponse } from "../data/base-response.model";
import { CONFIG } from "../config-global";
/**
 * Main Axios Instance
 *
 * Authentication Strategy:
 * - Pure httpOnly cookie-based authentication (secure, XSS-protected)
 * - No Authorization headers (prevents HTTP 431 errors)
 * - withCredentials: true ensures cookies are automatically sent with every request
 * - Tokens managed by server-side cookies (access_token, refresh_token, session_id)
 */
const AxiosInstance = axios.create({
  baseURL: `${CONFIG.serverUrl}/api`, // Add /api to match backend routes
  withCredentials: true, // Critical: Enables cookie-based authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Cookies are automatically sent via withCredentials: true
AxiosInstance.interceptors.request.use(
  (config) => {
    // Log full URL for debugging
    const fullUrl = config.baseURL
      ? `${config.baseURL}${config.url}`
      : config.url;
    console.log("🚀 Request:", config.method?.toUpperCase(), fullUrl);
    console.log("   Auth: 🍪 Cookie-based (secure)");

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle token refresh
AxiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.log("❌ Error:", error.response?.status, originalRequest?.url);
    console.log("   Error message:", error.response?.data?.message);

    // Don't attempt token refresh for authentication endpoints (login, register, etc.)
    const authEndpoints = [
      "/auth/sign-in",
      "/auth/check-email",
      "/auth/send-verification",
      "/auth/verify-code",
      "/auth/reset-password",
    ];
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      originalRequest?.url?.includes(endpoint)
    );

    // Handle 401/410 Unauthorized - Try to refresh token (but not for auth endpoints)
    if (
      error.response &&
      [401, 410].includes(error.response.status) &&
      !originalRequest._retry &&
      !isAuthEndpoint // Don't refresh on login/auth failures
    ) {
      originalRequest._retry = true;

      try {
        // Always attempt refresh via httpOnly refresh token cookie
        // (Remember Me should only control persistence on login, not automatic refresh)
        console.log("🔄 Attempting token refresh via cookie...");
        console.log(
          "   Original request was:",
          originalRequest.method,
          originalRequest.url
        );

        // Call refresh endpoint - server reads refresh token from httpOnly cookie
        const response = await axios.post<
          BaseResponse<{ accessToken: string; refreshToken: string }>
        >(
          `${CONFIG.serverUrl}/api/auth/refresh-token`,
          {}, // Empty body - refresh token is in httpOnly cookie
          { withCredentials: true } // Send cookies
        );

        if (response.data.success) {
          console.log("✅ Token refreshed successfully via cookie");

          // Retry the original request - new access token is now in cookie
          return AxiosInstance(originalRequest);
        } else {
          console.log("❌ Token refresh failed - session expired");
          TokenService.clearSession();
          window.location.href = "/auth/sign-in"; // Redirect to login
          return Promise.reject(response.data.message);
        }
      } catch (refreshError) {
        console.error("❌ Token refresh error - session expired");
        TokenService.clearSession();
        window.location.href = "/auth/sign-in"; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    // For auth endpoint failures, don't redirect - just return the error
    if (isAuthEndpoint) {
      console.log("⚠️ Auth endpoint failed (expected for invalid credentials)");
      return Promise.reject(error);
    }

    // Show error toast for other errors
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.message || error.message;
      console.error("API Error:", message);
    } else {
      console.error("Unknown Error:", error);
    }

    return Promise.reject(error);
  }
);

export const GET = (
  url: string,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return AxiosInstance.get(url, config);
};

export const POST = (
  url: string,
  body: any,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return AxiosInstance.post(url, body, config);
};

export const PATCH = (url: string, body: any) => {
  return AxiosInstance.patch(url, body);
};

export const PUT = (url: string, body: any) => {
  return AxiosInstance.put(url, body);
};

export const DELETE = (
  url: string,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return AxiosInstance.delete(url, config);
};

export const DOWNLOAD = (
  url: string,
  config?: AxiosRequestConfig<any> | undefined
) => {
  return AxiosInstance.get(url, { ...config, responseType: "blob" });
};

export default AxiosInstance;
