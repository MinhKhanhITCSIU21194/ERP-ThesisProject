import { Request, Response } from "express";
export declare class NotificationController {
    getUserNotifications(req: Request, res: Response): Promise<void>;
    getUnreadCount(req: Request, res: Response): Promise<void>;
    markAsRead(req: Request, res: Response): Promise<void>;
    markAllAsRead(req: Request, res: Response): Promise<void>;
    deleteNotification(req: Request, res: Response): Promise<void>;
    deleteAllRead(req: Request, res: Response): Promise<void>;
    createNotification(req: Request, res: Response): Promise<void>;
    sendTestNotification(req: Request, res: Response): Promise<void>;
}
export declare const notificationController: NotificationController;
//# sourceMappingURL=notification.controller.d.ts.map