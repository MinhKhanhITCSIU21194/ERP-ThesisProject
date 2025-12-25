export declare enum NotificationType {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    SUCCESS = "success"
}
export declare class Notification {
    notificationId: number;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    recipientUserId: string;
    sentByUserId?: string;
    createdAt: Date;
    readAt?: Date;
    recipient: any;
    sentBy?: any;
    markAsRead(): void;
    isUrgent(): boolean;
    getDisplayClass(): string;
}
//# sourceMappingURL=notification.d.ts.map