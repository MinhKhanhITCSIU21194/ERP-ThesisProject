# Real-Time Notification System with Socket.IO

## Overview

This ERP system now includes a **real-time notification system** using Socket.IO. Notifications are instantly delivered to users without polling, providing immediate updates for events like:

- 📋 Leave request submissions, approvals, and rejections
- 👥 Project assignments (added/removed from projects)
- 📄 Contract expirations
- ✏️ Profile updates
- 📝 Document signature requests
- ⏰ Timesheet reminders
- 💰 Salary processing notifications

## Architecture

### Backend Components

#### 1. **Socket.IO Server** (`back-end/src/config/socket.ts`)

- Handles WebSocket connections with JWT authentication
- Manages user rooms for targeted notifications
- Emits events: `notification:new`, `notification:read`, `notification:deleted`
- Tracks online users and connection status

#### 2. **Notification Service** (`back-end/src/services/notification.service.ts`)

- Creates notifications in the database
- Automatically emits Socket.IO events when notifications are created
- Supports single and bulk notification creation
- Includes 10+ notification templates for common scenarios

#### 3. **Notification Controller** (`back-end/src/controllers/notification.controller.ts`)

- REST API endpoints for notification management
- Handles CRUD operations with proper authentication

#### 4. **App Initialization** (`back-end/src/app.ts`)

- Initializes Socket.IO server alongside Express
- Connects to HTTP server for WebSocket support

### Frontend Components

#### 1. **Socket Provider** (`front-end/src/context/socket-provider.tsx`)

- React Context for Socket.IO client
- Manages connection lifecycle
- Handles incoming notification events
- Integrates with Redux store
- Shows browser notifications (with permission)

#### 2. **Redux Notification Slice** (`front-end/src/redux/notification/notification.slice.ts`)

- State management for notifications
- Actions: fetch, mark as read, delete, load more
- Real-time state updates from Socket.IO

#### 3. **Notification Dropdown** (`front-end/src/pages/dashboard/components/NotificationDropdown.tsx`)

- UI component for displaying notifications
- Features:
  - Unread count badge
  - Mark as read/delete actions
  - Load more pagination
  - Real-time updates
  - Visual indicators for notification types

#### 4. **Header Integration** (`front-end/src/pages/dashboard/components/header.tsx`)

- Notification bell icon with unread badge
- Dropdown menu on click
- Connection status indicator

## How It Works

### Backend Flow

1. **Event occurs** (e.g., leave request submitted)
2. **Service creates notification** using `notificationService.createNotification()`
3. **Notification saved to database**
4. **Socket.IO emits** `notification:new` event to recipient's room
5. **All recipient's devices** receive the notification instantly

### Frontend Flow

1. **User authenticates** and Socket.IO connects with JWT
2. **Socket joins user's personal room** (`user:{userId}`)
3. **Listens for events**: `notification:new`, `notification:read`, `notification:deleted`
4. **Redux state updates** automatically
5. **UI re-renders** with new notification
6. **Browser notification** shown (if permission granted)

## Socket.IO Events

### Server → Client

| Event                  | Payload               | Description                 |
| ---------------------- | --------------------- | --------------------------- |
| `connected`            | `{ message, userId }` | Connection successful       |
| `notification:new`     | `Notification`        | New notification received   |
| `notification:read`    | `{ notificationId }`  | Notification marked as read |
| `notification:deleted` | `{ notificationId }`  | Notification deleted        |

### Client → Server

| Event                 | Payload              | Description               |
| --------------------- | -------------------- | ------------------------- |
| `notification:read`   | `{ notificationId }` | Mark notification as read |
| `notification:delete` | `{ notificationId }` | Delete notification       |

## Authentication

Socket.IO uses JWT authentication:

```typescript
// Client sends token on connection
const socket = io(serverUrl, {
  auth: {
    token: accessToken,
  },
});
```

Server verifies token and extracts user info:

```typescript
socket.userId = decoded.userId;
socket.join(`user:${userId}`);
```

## Usage Examples

### Creating a Notification (Backend)

```typescript
import { notificationService } from "./services/notification.service";

// Single notification
await notificationService.createNotification({
  title: "New Leave Request",
  message: "John Doe submitted a leave request",
  type: NotificationType.INFO,
  recipientUserId: managerId,
  sentByUserId: employeeId,
});

// Using template
await notificationService.notifyLeaveRequestSubmitted(
  managerId,
  "John Doe",
  "Annual Leave",
  "2025-01-15 to 2025-01-20"
);
```

### Accessing Socket in Frontend

```typescript
import { useSocket } from "../context/socket-provider";

function MyComponent() {
  const { socket, isConnected } = useSocket();

  return <div>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</div>;
}
```

## Environment Variables

### Backend (.env)

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

## Browser Notifications

The system requests permission for browser notifications:

- **Granted**: Shows desktop notifications when app is in background
- **Denied**: Only shows in-app notifications
- **Default**: Prompts user on first connection

## Features

### ✅ Implemented

- Real-time notification delivery via Socket.IO
- JWT authentication for WebSocket connections
- User-specific notification rooms
- Multiple device support (same user, multiple tabs/devices)
- Browser notification integration
- Unread count badge
- Mark as read/delete actions
- Pagination (load more)
- 10+ notification templates
- Connection status indicator

### 🔜 Future Enhancements

- Notification preferences (email, push, in-app)
- Notification categories and filtering
- Mark all as read
- Notification sound effects
- Retry logic for failed connections
- Notification history search
- Custom notification actions (e.g., "Approve", "Reject")

## Testing

### Test Real-Time Notifications

1. **Open two browser tabs** with different users
2. **User A triggers event** (e.g., submit leave request)
3. **User B receives notification** instantly in both tabs
4. **Check console** for Socket.IO connection logs
5. **Verify browser notification** appears

### Testing Tools

- **Socket.IO Admin UI**: Monitor connections and rooms
- **Browser DevTools**: Check WebSocket frames in Network tab
- **Console logs**: Connection status and events

## Troubleshooting

### Connection Issues

```typescript
// Check socket status
console.log(socket.connected); // true/false

// Listen for errors
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});
```

### Token Expired

- Socket will disconnect with "Authentication error"
- Frontend should refresh token and reconnect
- Implement token refresh in `socket-provider.tsx`

### CORS Issues

- Ensure `FRONTEND_URL` is correctly set in backend `.env`
- Check Socket.IO CORS configuration in `socket.ts`

## Performance

- **Instant delivery**: ~50ms latency for local connections
- **Scalable**: Supports thousands of concurrent connections
- **Efficient**: Only sends to affected users
- **Battery-friendly**: WebSocket is more efficient than polling

## Security

✅ **Implemented Security Measures**:

- JWT authentication required for all connections
- User can only join their own room
- Server validates user identity before sending notifications
- CORS protection enabled
- No sensitive data in Socket.IO events

🔒 **Best Practices**:

- Never trust client-emitted events without validation
- Always verify user permissions server-side
- Use HTTPS/WSS in production
- Rate limit Socket.IO events
- Monitor for suspicious connection patterns

## Production Deployment

### Backend

1. Use **HTTPS** (Socket.IO will use WSS automatically)
2. Set `NODE_ENV=production`
3. Configure proper CORS origins
4. Use Redis adapter for multi-server setups:
   ```typescript
   import { createAdapter } from "@socket.io/redis-adapter";
   io.adapter(createAdapter(redisClient));
   ```

### Frontend

1. Update `VITE_API_URL` to production backend URL
2. Ensure SSL certificate is valid
3. Test across different networks (WiFi, mobile)

## Monitoring

Track these metrics in production:

- Connected users count
- Average connection duration
- Failed authentication attempts
- Message delivery rate
- Error rates

---

**Created:** 2025-11-12  
**Last Updated:** 2025-11-12  
**Version:** 1.0.0
