import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  email?: string;
}

export class SocketService {
  private io: Server;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error("Authentication error: Token required"));
        }

        const decoded = await verifyToken(token);
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        socket.email = decoded.email;

        console.log(
          `✅ Socket authenticated: ${socket.userId} (${socket.username})`
        );
        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      console.log(`🔌 User connected: ${userId} (Socket: ${socket.id})`);

      // Track user's socket connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)!.push(socket.id);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`🔌 User disconnected: ${userId} (Socket: ${socket.id})`);
        const sockets = this.userSockets.get(userId) || [];
        const filtered = sockets.filter((id) => id !== socket.id);

        if (filtered.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, filtered);
        }
      });

      // Handle notification read acknowledgment
      socket.on("notification:read", (data: { notificationId: number }) => {
        console.log(`📖 Notification ${data.notificationId} read by ${userId}`);
        // Broadcast to all user's devices
        this.io.to(`user:${userId}`).emit("notification:read", data);
      });

      // Handle notification delete acknowledgment
      socket.on("notification:delete", (data: { notificationId: number }) => {
        console.log(
          `🗑️ Notification ${data.notificationId} deleted by ${userId}`
        );
        // Broadcast to all user's devices
        this.io.to(`user:${userId}`).emit("notification:deleted", data);
      });

      // Send connection success
      socket.emit("connected", {
        message: "Connected to notification service",
        userId,
      });
    });
  }

  /**
   * Send a notification to a specific user
   */
  public sendNotificationToUser(userId: string, notification: any) {
    console.log(
      `📬 Sending notification to user ${userId}:`,
      notification.title
    );
    this.io.to(`user:${userId}`).emit("notification:new", notification);
  }

  /**
   * Send notifications to multiple users
   */
  public sendNotificationToUsers(userIds: string[], notification: any) {
    console.log(
      `📬 Sending notification to ${userIds.length} users:`,
      notification.title
    );
    userIds.forEach((userId) => {
      this.io.to(`user:${userId}`).emit("notification:new", notification);
    });
  }

  /**
   * Broadcast notification to all connected users
   */
  public broadcastNotification(notification: any) {
    console.log(
      `📢 Broadcasting notification to all users:`,
      notification.title
    );
    this.io.emit("notification:new", notification);
  }

  /**
   * Get online status of a user
   */
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get count of online users
   */
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get Socket.IO instance
   */
  public getIO(): Server {
    return this.io;
  }
}

let socketService: SocketService | null = null;

export const initializeSocketService = (
  httpServer: HTTPServer
): SocketService => {
  if (!socketService) {
    socketService = new SocketService(httpServer);
    console.log("✅ Socket.IO service initialized");
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error(
      "Socket service not initialized. Call initializeSocketService first."
    );
  }
  return socketService;
};
