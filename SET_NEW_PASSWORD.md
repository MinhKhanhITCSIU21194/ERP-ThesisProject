# Set New Password & Auto Sign-In Feature

This feature allows users to set a new password and automatically signs them in with full authentication (access token, refresh token, session, and cookies).

## 🔐 **API Endpoint**

### POST `/api/auth/set-new-password`

Sets a new password for a user and automatically signs them in with full authentication.

#### **Request Body:**

```json
{
  "userIdentifier": "user@example.com", // Email or userId
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!" // Optional but recommended
}
```

#### **Success Response (200):**

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "sessionId": "uuid-session-id",
  "tokenType": "Bearer",
  "expiresIn": "30m",
  "expiresAt": "2025-10-07T11:30:00.000Z",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": {
      "id": 1,
      "name": "Employee",
      "permissions": {}
    },
    "isActive": true,
    "isEmailVerified": true,
    "lastLogin": "2025-10-07T10:30:00.000Z",
    "unreadNotifications": 1
  },
  "loginTime": "2025-10-07T10:30:00.000Z",
  "message": "Password updated and user signed in successfully"
}
```

#### **Error Response (400):**

```json
{
  "success": false,
  "message": "Password validation failed",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one special character"
  ]
}
```

## 🛡️ **Password Security Requirements**

The system enforces strong password policies:

### **Validation Rules:**

1. **Length**: 8-128 characters
2. **Uppercase**: At least one uppercase letter (A-Z)
3. **Lowercase**: At least one lowercase letter (a-z)
4. **Numbers**: At least one digit (0-9)
5. **Special Characters**: At least one special character (!@#$%^&\*(),.?":{}|<>)
6. **Common Password Check**: Rejects common weak passwords

### **Examples:**

#### ✅ **Valid Passwords:**

- `MySecurePass123!`
- `Welcome2024@ERP`
- `Strong#Password789`

#### ❌ **Invalid Passwords:**

- `password` (too common)
- `12345678` (no letters/special chars)
- `Password` (no numbers/special chars)
- `pass123!` (too short)

## 🔄 **Complete Authentication Flow**

When a user sets a new password, the system:

1. **Validates Password Strength**
2. **Updates User Record**:
   - Hashes and stores new password
   - Updates `passwordChangedAt` timestamp
   - Resets failed login attempts
   - Unlocks account if locked
3. **Creates Security Notification**
4. **Generates Authentication Tokens**:
   - Access token (30 minutes)
   - Refresh token (7 days)
   - Session ID for tracking
5. **Sets Secure Cookies** (if browser client)
6. **Updates Last Login**
7. **Returns Full Authentication Data**

## 🍪 **Cookie Management**

If the request includes a `res` object, cookies are automatically set:

```
Set-Cookie: refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=604800
Set-Cookie: session_id=uuid-here; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

## 📝 **Usage Examples**

### **Frontend Implementation:**

#### **React/JavaScript:**

```javascript
const setNewPassword = async (userIdentifier, newPassword, confirmPassword) => {
  try {
    const response = await fetch("/api/auth/set-new-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // For cookie support
      body: JSON.stringify({
        userIdentifier,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // User is now authenticated
      // Store user data in Redux/state management
      dispatch(
        setAuth({
          user: data.user,
          accessToken: data.accessToken,
          sessionId: data.sessionId,
          expiresAt: data.expiresAt,
        })
      );

      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      // Handle validation errors
      setErrors(data.errors || [data.message]);
    }
  } catch (error) {
    console.error("Password set error:", error);
  }
};
```

#### **Axios:**

```javascript
import axios from "axios";

const setNewPassword = async (userData) => {
  try {
    const response = await axios.post("/api/auth/set-new-password", userData, {
      withCredentials: true, // For cookie support
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      errors: error.response?.data?.errors || [error.response?.data?.message],
    };
  }
};
```

### **Password Reset Flow Integration:**

```javascript
// Complete password reset flow
const completePasswordReset = async (
  resetToken,
  newPassword,
  confirmPassword
) => {
  try {
    // Step 1: Verify reset token and get user identifier
    const verifyResponse = await fetch("/api/auth/verify-reset-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      throw new Error("Invalid or expired reset token");
    }

    // Step 2: Set new password and auto sign-in
    const passwordResponse = await fetch("/api/auth/set-new-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userIdentifier: verifyData.userIdentifier,
        newPassword,
        confirmPassword,
      }),
    });

    const passwordData = await passwordResponse.json();

    if (passwordData.success) {
      // User is now authenticated and signed in
      return { success: true, user: passwordData.user };
    } else {
      throw new Error(passwordData.message);
    }
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: error.message };
  }
};
```

## 🔒 **Security Features**

### **Built-in Security:**

- **Password Hashing**: bcrypt with 12 salt rounds
- **Account Unlock**: Automatically unlocks locked accounts
- **Failed Attempts Reset**: Clears previous failed login attempts
- **Audit Trail**: Updates `passwordChangedAt` timestamp
- **Notification**: Creates security notification for user
- **Session Tracking**: Full session management with IP/User Agent

### **Session Security:**

- **Token Rotation**: New refresh token generated
- **Session Isolation**: Each password change creates new session
- **Cookie Security**: HttpOnly, Secure, SameSite protection
- **Automatic Cleanup**: Old sessions remain tracked

## 📊 **Database Changes**

When password is set, the following database changes occur:

```sql
-- Users table updates:
UPDATE users SET
  passwordHash = 'new-bcrypt-hash',
  passwordChangedAt = NOW(),
  failedLoginAttempts = 0,
  accountLockedUntil = NULL,
  lastLogin = NOW()
WHERE userId = 'user-id';

-- New session created:
INSERT INTO sessions (sessionId, userId, refreshToken, ipAddress, userAgent, isActive, expiresAt)
VALUES ('new-session-id', 'user-id', 'new-refresh-token', '192.168.1.1', 'Mozilla/5.0...', true, '2025-10-14');

-- Security notification created:
INSERT INTO notifications (recipientUserId, title, message, type, isRead)
VALUES ('user-id', 'Password Changed', 'Your password has been successfully updated', 'success', false);
```

## 🧪 **Testing**

### **Test Cases:**

1. **Valid Password Update**:

   ```bash
   curl -X POST http://localhost:5000/api/auth/set-new-password \
     -H "Content-Type: application/json" \
     -d '{
       "userIdentifier": "test@example.com",
       "newPassword": "NewSecure123!",
       "confirmPassword": "NewSecure123!"
     }'
   ```

2. **Password Validation Errors**:

   ```bash
   curl -X POST http://localhost:5000/api/auth/set-new-password \
     -H "Content-Type: application/json" \
     -d '{
       "userIdentifier": "test@example.com",
       "newPassword": "weak",
       "confirmPassword": "weak"
     }'
   ```

3. **Password Mismatch**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/set-new-password \
     -H "Content-Type: application/json" \
     -d '{
       "userIdentifier": "test@example.com",
       "newPassword": "Strong123!",
       "confirmPassword": "Different123!"
     }'
   ```

## 🚀 **Integration Points**

This endpoint can be used for:

1. **Password Reset Flow**: After email verification
2. **First-Time Setup**: New user password creation
3. **Password Change**: User-initiated password updates
4. **Admin Password Reset**: Administrative password changes
5. **Security Enforcement**: Forced password updates

The automatic sign-in feature eliminates the need for users to manually log in after setting their password, providing a seamless user experience while maintaining security! 🔐
