# Cookie-Based Authentication System

This document describes the implementation of a secure dual-token cookie-based authentication system for the ERP Back-End.

## Overview

The system implements a dual-token approach:

- **Access Token**: Short-lived (30 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Session Tracking**: Database-stored sessions for revocation and monitoring

## Features

### 🔐 Security Features

- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS-only cookies in production
- **SameSite**: CSRF protection
- **Token Rotation**: Automatic refresh token rotation
- **Session Tracking**: IP address and user agent logging
- **Account Lockout**: Failed login attempt protection
- **Session Cleanup**: Automatic expired session removal

### 🍪 Cookie Configuration

```typescript
{
  httpOnly: true,        // Prevent client-side access
  secure: production,    // HTTPS only in production
  sameSite: 'strict',    // CSRF protection
  path: '/api/auth',     // Refresh token scope
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/sign-in`

Sign in with email and password

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "sessionId": "uuid-session-id",
  "expiresAt": "2024-01-15T10:30:00.000Z",
  "expiresIn": "30m",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": { ... }
  },
  "message": "Sign in successful"
}
```

**Cookies Set:**

- `refresh_token`: HttpOnly, secure refresh token
- `session_id`: Session identifier for tracking

#### POST `/api/auth/refresh-token`

Refresh access token using refresh token from cookies or body

```json
{
  "refreshToken": "optional-if-not-in-cookies"
}
```

**Response:**

```json
{
  "success": true,
  "accessToken": "new-access-token",
  "expiresAt": "2024-01-15T11:00:00.000Z",
  "expiresIn": "30m",
  "user": { ... },
  "message": "Token refreshed successfully"
}
```

#### POST `/api/auth/logout`

Logout current session

```json
{
  "sessionId": "optional-if-not-in-cookies",
  "refreshToken": "optional-if-not-in-cookies"
}
```

#### POST `/api/auth/logout-all`

Logout from all devices

```json
{
  "userId": "user-uuid"
}
```

#### GET `/api/auth/sessions/:userId`

Get active sessions for user (Protected)
**Response:**

```json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "uuid",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "lastActivity": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "expiresAt": "2024-01-22T08:00:00.000Z"
    }
  ]
}
```

## Environment Variables

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here
REFRESH_TOKEN_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## Usage Examples

### Frontend Integration

#### Using Fetch with Credentials

```javascript
// Sign in
const response = await fetch("/api/auth/sign-in", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Important: Include cookies
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});

// Protected API calls
const protectedResponse = await fetch("/api/auth/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    // OR rely on automatic cookie authentication
  },
  credentials: "include",
});
```

#### Axios Configuration

```javascript
// Configure axios defaults
axios.defaults.withCredentials = true;

// Interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await axios.post("/api/auth/refresh-token");
        // Retry original request
        return axios.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

## Security Considerations

### 🔒 Best Practices Implemented

1. **Dual Token System**: Separates access and refresh concerns
2. **Short Access Token Lifetime**: Minimizes exposure window
3. **Secure Cookie Storage**: HttpOnly prevents XSS access
4. **CSRF Protection**: SameSite cookie attribute
5. **Session Revocation**: Database-tracked sessions
6. **IP & User Agent Logging**: Fraud detection support
7. **Automatic Cleanup**: Expired session removal

### 🚨 Security Headers

Ensure your reverse proxy/web server adds:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## Database Schema

### Sessions Table

The system automatically creates sessions with:

- `sessionId`: Unique session identifier
- `userId`: Associated user
- `refreshToken`: Encrypted refresh token
- `ipAddress`: Client IP for monitoring
- `userAgent`: Client browser info
- `isActive`: Session validity flag
- `expiresAt`: Session expiration
- `lastActivity`: Last request timestamp

## Monitoring & Logging

### Session Analytics

- Track active sessions per user
- Monitor login patterns by IP/location
- Detect suspicious login activities
- Session duration analytics

### Automatic Cleanup

- Expired sessions removed every hour
- Manual cleanup via service method
- Graceful shutdown handling

## Migration Guide

### From Header-Only Authentication

1. Update frontend to include `credentials: 'include'`
2. Remove manual token storage in localStorage
3. Handle 401 responses with refresh logic
4. Update logout to call `/api/auth/logout`

### Configuration Updates

1. Add new environment variables
2. Update CORS configuration
3. Ensure cookie-parser middleware
4. Start session cleanup service

## Troubleshooting

### Common Issues

#### Cookies Not Being Set

- Check CORS `credentials: true`
- Verify cookie domain settings
- Ensure HTTPS in production with secure flag

#### Token Refresh Failing

- Verify refresh token secret configuration
- Check session expiration in database
- Validate cookie path restrictions

#### CORS Errors

- Update CORS origin configuration
- Include credentials in frontend requests
- Check preflight OPTIONS handling

## Performance Considerations

- Session cleanup runs hourly (configurable)
- Database queries optimized with indexes
- Cookie size minimal (just session ID)
- Refresh token validation cached

## Testing

### Unit Tests

```bash
npm test -- auth.service.spec.ts
npm test -- cookie.service.spec.ts
```

### Integration Tests

```bash
npm test -- auth.integration.spec.ts
```

### Manual Testing

1. Sign in and verify cookies are set
2. Make authenticated requests
3. Test token refresh
4. Verify logout clears cookies
5. Test session expiration

---

**Note**: This system provides enterprise-grade security while maintaining ease of use. All tokens are properly validated, sessions are tracked, and security best practices are implemented throughout.
