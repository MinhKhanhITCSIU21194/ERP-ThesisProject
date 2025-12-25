/**
 * ⚠️ DEPRECATED - Use services/axios.ts instead
 *
 * This file is kept for backward compatibility only.
 * All HTTP requests should use the main axios instance from services/axios.ts
 * which has comprehensive authentication, token refresh, and error handling.
 *
 * @deprecated Import from services/axios.ts instead
 */

// Re-export the main configured axios instance
export { default } from "../services/axios";
