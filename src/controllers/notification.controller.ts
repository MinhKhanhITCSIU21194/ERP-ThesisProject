import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { NotificationType } from "../models/entities/notification";

export class NotificationController {
  /**
   * Get all notifications for the authenticated user
   * GET /api/notifications
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { unreadOnly, limit, offset } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        unreadOnly: unreadOnly === "true",
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result.notifications,
        total: result.total,
        unreadCount: result.unreadCount,
      });
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        count,
      });
    } catch (error: any) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Mark notification as read
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const notificationId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(notificationId)) {
        res.status(400).json({ error: "Invalid notification ID" });
        return;
      }

      const notification = await notificationService.markAsRead(
        notificationId,
        userId
      );

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking all as read:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const notificationId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (isNaN(notificationId)) {
        res.status(400).json({ error: "Invalid notification ID" });
        return;
      }

      await notificationService.deleteNotification(notificationId, userId);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Delete all read notifications
   * DELETE /api/notifications/read
   */
  async deleteAllRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await notificationService.deleteAllRead(userId);

      res.status(200).json({
        success: true,
        message: "All read notifications deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting read notifications:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Create a notification (for testing or admin purposes)
   * POST /api/notifications
   */
  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { title, message, type, recipientUserId } = req.body;

      if (!title || !message || !recipientUserId) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const notification = await notificationService.createNotification({
        title,
        message,
        type: type || NotificationType.INFO,
        recipientUserId,
        sentByUserId: userId,
      });

      res.status(201).json({
        success: true,
        data: notification,
        message: "Notification created and sent via Socket.IO",
      });
    } catch (error: any) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  /**
   * Test notification endpoint - sends a test notification to yourself
   * POST /api/notifications/test
   */
  async sendTestNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notification = await notificationService.createNotification({
        title: "🎉 Test Notification",
        message:
          "This is a real-time test notification! If you see this instantly, Socket.IO is working perfectly.",
        type: NotificationType.SUCCESS,
        recipientUserId: userId,
        sentByUserId: userId,
      });

      res.status(201).json({
        success: true,
        data: notification,
        message: "Test notification sent! Check your notification dropdown.",
      });
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
}

export const notificationController = new NotificationController();
