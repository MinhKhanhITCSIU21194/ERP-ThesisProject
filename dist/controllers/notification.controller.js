"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const notification_1 = require("../models/entities/notification");
class NotificationController {
    async getUserNotifications(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { unreadOnly, limit, offset } = req.query;
            const result = await notification_service_1.notificationService.getUserNotifications(userId, {
                unreadOnly: unreadOnly === "true",
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            });
            res.status(200).json({
                success: true,
                data: result.notifications,
                total: result.total,
                unreadCount: result.unreadCount,
            });
        }
        catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const count = await notification_service_1.notificationService.getUnreadCount(userId);
            res.status(200).json({
                success: true,
                count,
            });
        }
        catch (error) {
            console.error("Error fetching unread count:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.user?.userId;
            const notificationId = parseInt(req.params.id);
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            if (isNaN(notificationId)) {
                res.status(400).json({ error: "Invalid notification ID" });
                return;
            }
            const notification = await notification_service_1.notificationService.markAsRead(notificationId, userId);
            res.status(200).json({
                success: true,
                data: notification,
            });
        }
        catch (error) {
            console.error("Error marking notification as read:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async markAllAsRead(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            await notification_service_1.notificationService.markAllAsRead(userId);
            res.status(200).json({
                success: true,
                message: "All notifications marked as read",
            });
        }
        catch (error) {
            console.error("Error marking all as read:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async deleteNotification(req, res) {
        try {
            const userId = req.user?.userId;
            const notificationId = parseInt(req.params.id);
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            if (isNaN(notificationId)) {
                res.status(400).json({ error: "Invalid notification ID" });
                return;
            }
            await notification_service_1.notificationService.deleteNotification(notificationId, userId);
            res.status(200).json({
                success: true,
                message: "Notification deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting notification:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async deleteAllRead(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            await notification_service_1.notificationService.deleteAllRead(userId);
            res.status(200).json({
                success: true,
                message: "All read notifications deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting read notifications:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async createNotification(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { title, message, type, recipientUserId } = req.body;
            if (!title || !message || !recipientUserId) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }
            const notification = await notification_service_1.notificationService.createNotification({
                title,
                message,
                type: type || notification_1.NotificationType.INFO,
                recipientUserId,
                sentByUserId: userId,
            });
            res.status(201).json({
                success: true,
                data: notification,
                message: "Notification created and sent via Socket.IO",
            });
        }
        catch (error) {
            console.error("Error creating notification:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
    async sendTestNotification(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const notification = await notification_service_1.notificationService.createNotification({
                title: "🎉 Test Notification",
                message: "This is a real-time test notification! If you see this instantly, Socket.IO is working perfectly.",
                type: notification_1.NotificationType.SUCCESS,
                recipientUserId: userId,
                sentByUserId: userId,
            });
            res.status(201).json({
                success: true,
                data: notification,
                message: "Test notification sent! Check your notification dropdown.",
            });
        }
        catch (error) {
            console.error("Error sending test notification:", error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map