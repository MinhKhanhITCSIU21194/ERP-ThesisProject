"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketService = exports.initializeSocketService = exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
class SocketService {
    constructor(httpServer) {
        this.userSockets = new Map();
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:5173",
                credentials: true,
            },
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error("Authentication error: Token required"));
                }
                const decoded = await (0, jwt_1.verifyToken)(token);
                socket.userId = decoded.userId;
                socket.username = decoded.username;
                socket.email = decoded.email;
                console.log(`✅ Socket authenticated: ${socket.userId} (${socket.username})`);
                next();
            }
            catch (error) {
                console.error("Socket authentication error:", error);
                next(new Error("Authentication error: Invalid token"));
            }
        });
    }
    setupEventHandlers() {
        this.io.on("connection", (socket) => {
            const userId = socket.userId;
            console.log(`🔌 User connected: ${userId} (Socket: ${socket.id})`);
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, []);
            }
            this.userSockets.get(userId).push(socket.id);
            socket.join(`user:${userId}`);
            socket.on("disconnect", () => {
                console.log(`🔌 User disconnected: ${userId} (Socket: ${socket.id})`);
                const sockets = this.userSockets.get(userId) || [];
                const filtered = sockets.filter((id) => id !== socket.id);
                if (filtered.length === 0) {
                    this.userSockets.delete(userId);
                }
                else {
                    this.userSockets.set(userId, filtered);
                }
            });
            socket.on("notification:read", (data) => {
                console.log(`📖 Notification ${data.notificationId} read by ${userId}`);
                this.io.to(`user:${userId}`).emit("notification:read", data);
            });
            socket.on("notification:delete", (data) => {
                console.log(`🗑️ Notification ${data.notificationId} deleted by ${userId}`);
                this.io.to(`user:${userId}`).emit("notification:deleted", data);
            });
            socket.emit("connected", {
                message: "Connected to notification service",
                userId,
            });
        });
    }
    sendNotificationToUser(userId, notification) {
        console.log(`📬 Sending notification to user ${userId}:`, notification.title);
        this.io.to(`user:${userId}`).emit("notification:new", notification);
    }
    sendNotificationToUsers(userIds, notification) {
        console.log(`📬 Sending notification to ${userIds.length} users:`, notification.title);
        userIds.forEach((userId) => {
            this.io.to(`user:${userId}`).emit("notification:new", notification);
        });
    }
    broadcastNotification(notification) {
        console.log(`📢 Broadcasting notification to all users:`, notification.title);
        this.io.emit("notification:new", notification);
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }
    getOnlineUsersCount() {
        return this.userSockets.size;
    }
    getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
let socketService = null;
const initializeSocketService = (httpServer) => {
    if (!socketService) {
        socketService = new SocketService(httpServer);
        console.log("✅ Socket.IO service initialized");
    }
    return socketService;
};
exports.initializeSocketService = initializeSocketService;
const getSocketService = () => {
    if (!socketService) {
        throw new Error("Socket service not initialized. Call initializeSocketService first.");
    }
    return socketService;
};
exports.getSocketService = getSocketService;
//# sourceMappingURL=socket.js.map