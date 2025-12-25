import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
export declare class SocketService {
    private io;
    private userSockets;
    constructor(httpServer: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    sendNotificationToUser(userId: string, notification: any): void;
    sendNotificationToUsers(userIds: string[], notification: any): void;
    broadcastNotification(notification: any): void;
    isUserOnline(userId: string): boolean;
    getOnlineUsersCount(): number;
    getIO(): Server;
}
export declare const initializeSocketService: (httpServer: HTTPServer) => SocketService;
export declare const getSocketService: () => SocketService;
//# sourceMappingURL=socket.d.ts.map