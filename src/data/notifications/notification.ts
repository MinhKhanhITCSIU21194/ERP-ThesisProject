export enum NotificationType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  recipientUserId: string;
  sentByUserId: string | null;
  createdAt: string;
  readAt: string | null;
  sentBy?: {
    userId: string;
    username: string;
    email: string;
  };
}

export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  total: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export interface NotificationActionResponse {
  success: boolean;
  data?: Notification;
  message?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  recipientUserId: string;
}

export interface GetNotificationsParams {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
