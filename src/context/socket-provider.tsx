import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectAuth } from "../redux/auth/auth.slice";
import { addNotification } from "../redux/notification/notification.slice";
import type { Notification as NotificationModel } from "../data/notifications/notification";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useAppDispatch();
  const { accessToken, user, success } = useAppSelector(selectAuth);

  useEffect(() => {
    // Disconnect existing socket if user logs out or token is not available
    if (!accessToken || !user || !success) {
      console.log("⚠️ No access token or user, disconnecting socket");
      if (socket) {
        console.log("🔌 Disconnecting existing socket");
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log("✅ User authenticated, initializing socket connection...");

    // Small delay to ensure httpOnly cookies are fully set before connecting
    // This prevents race conditions where socket connects before cookies are available
    const timer = setTimeout(() => {
      console.log("🔌 Connecting socket after cookie delay...");

      // Initialize Socket.IO connection with access token from Redux
      const newSocket = io(
        import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
        {
          auth: {
            token: accessToken,
          },
          transports: ["websocket", "polling"],
        }
      );

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("connected", (data) => {
        console.log("✅ Connected to notification service:", data);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setIsConnected(false);
      });

      // Notification event handlers
      newSocket.on("notification:new", (notification: NotificationModel) => {
        console.log("📬 New notification received:", notification);
        dispatch(addNotification(notification));

        // Show browser notification if permission granted
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/src/assets/ERP.png", // Update with your logo path
          });
        }
      });

      newSocket.on("notification:read", (data: { notificationId: number }) => {
        console.log("📖 Notification marked as read:", data.notificationId);
        // The Redux state will be updated by the markAsRead action
      });

      newSocket.on(
        "notification:deleted",
        (data: { notificationId: number }) => {
          console.log("🗑️ Notification deleted:", data.notificationId);
          // The Redux state will be updated by the deleteNotification action
        }
      );

      setSocket(newSocket);

      // Request browser notification permission
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission().then((permission) => {
          console.log("Browser notification permission:", permission);
        });
      }
    }, 300); // 300ms delay to ensure cookies are set

    // Cleanup on unmount or when dependencies change
    return () => {
      clearTimeout(timer);
      if (socket) {
        console.log("🔌 Disconnecting socket on cleanup");
        socket.disconnect();
      }
    };
  }, [dispatch, accessToken, user, success]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
