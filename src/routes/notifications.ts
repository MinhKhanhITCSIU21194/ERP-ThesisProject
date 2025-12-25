import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All notification routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for authenticated user
 * @query   unreadOnly (boolean), limit (number), offset (number)
 * @access  Private
 */
router.get(
  "/",
  notificationController.getUserNotifications.bind(notificationController)
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get(
  "/unread-count",
  notificationController.getUnreadCount.bind(notificationController)
);

/**
 * @route   POST /api/notifications
 * @desc    Create a notification (testing/admin)
 * @body    { title, message, type, recipientUserId }
 * @access  Private
 */
router.post(
  "/",
  notificationController.createNotification.bind(notificationController)
);

/**
 * @route   POST /api/notifications/test
 * @desc    Send a test notification to yourself
 * @access  Private
 */
router.post(
  "/test",
  notificationController.sendTestNotification.bind(notificationController)
);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch(
  "/read-all",
  notificationController.markAllAsRead.bind(notificationController)
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.patch(
  "/:id/read",
  notificationController.markAsRead.bind(notificationController)
);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete(
  "/read",
  notificationController.deleteAllRead.bind(notificationController)
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification
 * @access  Private
 */
router.delete(
  "/:id",
  notificationController.deleteNotification.bind(notificationController)
);

export default router;
